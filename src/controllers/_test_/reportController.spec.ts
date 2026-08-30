import { auditPdf, formatAuditLogs } from "../ReportController";
import * as postgresService from "../../helpers/postgresAudit.service";
import httpStatus from '../../config/http-status';

 
// Tell TypeScript it's a Jest mock function
jest.mock('../../helpers/postgresAudit.service', () => ({
  getReportsForAuditReportFromPostgres: jest.fn(),
}));
 
// Cast the imported function to Jest.Mock type
const mockedGetReports = postgresService.getReportsForAuditReportFromPostgres as jest.Mock;
 
describe('auditPdf', () => {
  let res: any;
 
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      locals: {
        user: { name: 'Test User' },
      },
    };
  });
 
  afterEach(() => {
    jest.clearAllMocks();
  });
 
  const mockBusinessId = 'biz-123';
 
  it('should return 400 if no audit reports are found', async () => {
    mockedGetReports.mockResolvedValue([]);
 
    await auditPdf(mockBusinessId, res, 'false');
 
    expect(mockedGetReports).toHaveBeenCalledWith(mockBusinessId);
    expect(res.status).toHaveBeenCalledWith(httpStatus.badRequest);
    expect(res.json).toHaveBeenCalledWith({
      status: {
        statusCode: '400',
        message: 'No data found',
      },
    });
  });
 
  it('should return 400 if getReportsForAuditReportFromPostgres throws an error', async () => {
    mockedGetReports.mockRejectedValue(new Error('Database error'));
 
    await auditPdf(mockBusinessId, res, 'false');
 
    expect(res.status).toHaveBeenCalledWith(httpStatus.badRequest);
    expect(res.json).toHaveBeenCalledWith({
      status: {
        statusCode: '400',
        message: 'Database error',
      },
    });
  });
 
  it('should generate and send PDF successfully with reports', async () => {
    const mockTimestamp = new Date().toISOString();
    const mockReports = [
      {
        get: () => ({
          records: {
            createdTimestamp: mockTimestamp,
            editedTimestamp: mockTimestamp,
            operation: 'CREATE',
            operationType: 'initial',
            createdBy: 'admin',
          },
        }),
      },
      {
        get: () => ({
          records: {
            createdTimestamp: mockTimestamp,
            editedTimestamp: mockTimestamp,
            operation: 'UPDATE',
            operationType: 'edit',
            createdBy: 'admin',
          },
        }),
      },
    ];
 
    mockedGetReports.mockResolvedValue(mockReports);
 
    await auditPdf(mockBusinessId, res, 'false');
 
    expect(mockedGetReports).toHaveBeenCalledWith(mockBusinessId);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      expect.stringContaining('Content-Disposition'),
      expect.stringContaining(`SIPAuditTrailReport_${mockBusinessId}`)
    );
    expect(res.write).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      locals: { user: { name: "Tester" } },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockRow = (records: any) => ({
    get: () => ({ records }),
  });

  it("covers INSERT, UPDATE, legacy parsing, special events, sorting", async () => {
    const reports = [
      // INSERT
      mockRow({
        operationType: "Insert",
        createdTimestamp: "2024-01-01T10:00:00Z",
        fieldA: 1,
      }),

      // FIRST UPDATE (compare with insert)
      mockRow({
        operationType: "Update",
        editedTimestamp: "2024-01-02T10:00:00Z",
        fieldA: 2,
      }),

      // SUBSEQUENT UPDATE
      mockRow({
        operationType: "Update",
        editedTimestamp: "2024-01-03T10:00:00Z",
        fieldA: 3,
      }),

      // LEGACY AFTER EVENT
      mockRow({
        operationType: "Update",
        createdTimestamp: "2024-01-04",
        VALUES_AFTER_EVENT: "x-1|y-2",
      }),

      // SPECIAL EVENT – standalone
      mockRow({
        eventType: "Result change event",
        timestamp: "2024-01-05",
        result: "changed",
      }),

      // SPECIAL EVENT – second occurrence (compare)
      mockRow({
        eventType: "Result change event",
        timestamp: "2024-01-06",
        result: "changed-again",
      }),

      // UNKNOWN TYPE + no timestamp
      mockRow({
        foo: "bar",
      }),
    ];

    mockedGetReports.mockResolvedValue(reports);

    await auditPdf("sip-123", res, "false");

    // Response assertions
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf"
    );
    expect(res.write).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();

    // Ensures formatAuditLogs executed fully
    expect(mockedGetReports).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when no reports exist", async () => {
    mockedGetReports.mockResolvedValue([]);

    await auditPdf("sip-empty", res, "false");

    expect(res.status).toHaveBeenCalledWith(httpStatus.badRequest);
    expect(res.json).toHaveBeenCalledWith({
      status: { statusCode: "400", message: "No data found" },
    });
  });

  it("handles postgres failure", async () => {
    mockedGetReports.mockRejectedValue(new Error("DB down"));

    await auditPdf("sip-fail", res, "false");

    expect(res.status).toHaveBeenCalledWith(httpStatus.badRequest);
    expect(res.json).toHaveBeenCalledWith({
      status: { statusCode: "400", message: "DB down" },
    });
  });
 
it("covers parseLegacy when VALUES_AFTER_EVENT is null or non-string", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Update",
      editedTimestamp: "2024-01-01",
      VALUES_AFTER_EVENT: null,
    }),
    mockRow({
      operationType: "Update",
      editedTimestamp: "2024-01-02",
      VALUES_AFTER_EVENT: 123,
    }),
  ]);

  await auditPdf("sip-legacy-null", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
it("covers parseLegacy with single key-value pair", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Insert",
      createdTimestamp: "2024-01-01",
      VALUES_AFTER_EVENT: "a-1",
    }),
  ]);

  await auditPdf("sip-single", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
it("covers parseLegacy with multiple legacy values", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Insert",
      createdTimestamp: "2024-01-01",
      VALUES_AFTER_EVENT: "a-1|b-2|c-3",
    }),
  ]);

  await auditPdf("sip-multi", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
it("covers parseLegacy with hyphenated values", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Update",
      editedTimestamp: "2024-01-02",
      VALUES_AFTER_EVENT: "desc-long-value-with-dash|x-10",
    }),
  ]);

  await auditPdf("sip-hyphen", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
it("covers parseLegacy using VALUES_BEFORE_EVENT", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Update",
      editedTimestamp: "2024-01-03",
      VALUES_BEFORE_EVENT: "x-9|y-8",
    }),
  ]);

  await auditPdf("sip-before", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
it("covers non-legacy path in extractValues", async () => {
  mockedGetReports.mockResolvedValue([
    mockRow({
      operationType: "Insert",
      createdTimestamp: "2024-01-01",
      foo: "bar",
    }),
  ]);

  await auditPdf("sip-normal", res, "false");

  expect(res.write).toHaveBeenCalled();
  expect(res.end).toHaveBeenCalled();
});
   it("handles Insert as standalone", () => {
    const logs = [
      {
        operationType: "Insert",
        createdTimestamp: "2024-01-01",
        a: 1,
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result).toEqual([
      {
        valueBefore: null,
        valueAfter: logs[0],
        legacy: false,
      },
    ]);
  });

  it("first Update compares with previous Insert", () => {
    const logs = [
      {
        operationType: "Insert",
        createdTimestamp: "2024-01-01",
        foo: "old",
      },
      {
        operationType: "Update",
        editedTimestamp: "2024-01-02",
        foo: "new",
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueBefore.foo).toBe("old");
    expect(result[0].valueAfter.foo).toBe("new");
  });

  it("first Update without Insert uses null valueBefore", () => {
    const logs = [
      {
        operationType: "Update",
        editedTimestamp: "2024-01-02",
        foo: "new",
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0]).toEqual({
      valueBefore: null,
      valueAfter: logs[0],
      legacy: false,
    });
  });

  it("parses legacy VALUES_AFTER_EVENT string", () => {
    const logs = [
      {
        operationType: "Update",
        editedTimestamp: "2024-01-02",
        VALUES_AFTER_EVENT: "a-1|b-hello-world",
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueAfter).toEqual({
      a: "1",
      b: "hello-world",
    });
    expect(result[0].legacy).toBe(true);
  });

  it("does NOT parse legacy when VALUES_AFTER_EVENT is null", () => {
  const logs = [
    {
      operationType: "Update",
      editedTimestamp: "2024-01-02",
      VALUES_AFTER_EVENT: null,
    },
  ];

  const result = formatAuditLogs(logs);

  expect(result[0].valueAfter).toEqual(logs[0]); 
});

  it("handles baseline change event as standalone first time", () => {
    const logs = [
      {
        eventType: "Baseline change event",
        editedTimestamp: "2024-01-01",
        value: 10,
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0]).toEqual({
      valueBefore: null,
      valueAfter: logs[0],
      legacy: false,
    });
  });

it("subsequent baseline change event compares with previous baseline", () => {
  const logs = [
    {
      eventType: "Baseline change event",
      assessmentId: "BSL-001",
      editedTimestamp: "2024-01-01",
      value: 10,
    },
    {
      eventType: "BASELINE CHANGE EVENT",
      assessmentId: "BSL-001",
      editedTimestamp: "2024-01-02",
      value: 20,
    },
  ];

  const result = formatAuditLogs(logs);

  const row = result.find(
    r => r.valueAfter?.value === 20
  );

  expect(row?.valueBefore?.value).toBe(10);
  expect(row?.valueAfter?.value).toBe(20);
});

  it("handles method change event standalone", () => {
    const logs = [
      {
        eventType: "Method change event",
        createdTimestamp: "2024-01-01",
        method: "A",
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueBefore).toBeNull();
  });

  it("handles result change event standalone", () => {
    const logs = [
      {
        eventType: "Result change event",
        createdTimestamp: "2024-01-01",
        result: "PASS",
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueAfter.result).toBe("PASS");
  });

  it("subsequent same type compares with previous occurrence", () => {
    const logs = [
      {
        operation: "Custom",
        editedTimestamp: "2024-01-01",
        value: 1,
      },
      {
        operation: "custom",
        editedTimestamp: "2024-01-02",
        value: 2,
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueBefore.value).toBe(1);
    expect(result[0].valueAfter.value).toBe(2);
  });

  it("sorts by timestamp and reverses to newest first", () => {
    const logs = [
      {
        operationType: "Insert",
        createdTimestamp: "2024-01-01",
        value: 1,
      },
      {
        operationType: "Update",
        editedTimestamp: "2024-01-03",
        value: 3,
      },
      {
        operationType: "Update",
        editedTimestamp: "2024-01-02",
        value: 2,
      },
    ];

    const result = formatAuditLogs(logs);

    expect(result[0].valueAfter.value).toBe(3);
    expect(result[1].valueAfter.value).toBe(2);
  });

});