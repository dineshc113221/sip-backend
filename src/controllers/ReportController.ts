/* eslint-disable @typescript-eslint/no-unused-expressions */
import { getReportsForAuditReportFromPostgres } from '../helpers/postgresAudit.service.js';
import {  sipReportConfig } from '../config/reportData.js';
import { diffString } from 'json-diff';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import httpStatus from '../config/http-status.js';
import { formatLabel } from '../helpers/common.service.js';


import mask from "json-mask";
import unset from "unset-value";
import cleanDeep from "clean-deep";


const removedProps = ['operation','isCalculationSnapshot','operationType','objectKey','createdTimestamp'];

interface CraftedObject {
  valueAfter: any,
  valueBefore: any,
  legacy?: boolean,
  eventType?:string
}

const filterFields = (masterObject: any, filterOption: any) => mask(masterObject, filterOption);

export const getCETDate = (gmtDate: Date) => {
  const localDate = gmtDate;
  const utcOffset = localDate.getTimezoneOffset();
  const cetOffset = utcOffset + 60;
  const cestOffset = utcOffset + 120;
  const cetOffsetInMilliseconds = cetOffset * 60 * 1000;
  const cestOffsetInMilliseconds = cestOffset * 60 * 1000;

  const cestDateStart = new Date();
  const cestDateFinish = new Date();
  const localDateTime = localDate.getTime();
  let result;

  cestDateStart.setTime(
    Date.parse(`29 March ${localDate.getFullYear()} 02:00:00 GMT+0100`),
  );
  cestDateFinish.setTime(
    Date.parse(`25 October ${localDate.getFullYear()} 03:00:00 GMT+0200`),
  );

  const cestDateStartTime = cestDateStart.getTime();
  const cestDateFinishTime = cestDateFinish.getTime();

  if (
    localDateTime >= cestDateStartTime
    && localDateTime <= cestDateFinishTime
  ) {
    result = new Date(localDateTime + cestOffsetInMilliseconds);
  } else {
    result = new Date(localDateTime + cetOffsetInMilliseconds);
  }

  const dateArray = result.toString().split('');
  dateArray.splice(3, 0, ',');
  const index = result.toString().indexOf('GMT');
  const dateString = `${dateArray.join('').slice(0, index)} CET`;

  return dateString;
};

const formatDateToGMTString = (obj: any) => {
  const rawMaterial = {
    ...obj?.rawMaterial,
    dateCreated: obj?.rawMaterial?.dateCreated
      ? getCETDate(new Date(obj?.rawMaterial?.dateCreated)) : undefined,
    dateModified: obj?.rawMaterial?.dateModified
      ? getCETDate(new Date(obj?.rawMaterial?.dateModified)) : undefined,
    approvedRegion: obj?.rawMaterial?.approvedRegion.map((reg: any) => ({
      ...reg,
      approvalDate: reg?.approvalDate
        ? getCETDate(new Date(reg?.approvalDate)) : undefined,
    })),
  };

  const attrb = {
    General: {
      ...obj?.attributes?.General,
      kosherValidDate: obj?.attributes?.General?.kosherValidDate
        ? new Date(obj.attributes.General.kosherValidDate).toUTCString() : undefined,
      halalValidDate: obj?.attributes?.General?.halalValidDate
        ? new Date(obj.attributes.General.halalValidDate).toUTCString() : undefined,
    },
    ExternalSystemData: {
      ...obj?.attributes?.ExternalSystemData,
    },
    Contains: {
      ...obj?.attributes?.Contains,
    },
    GHS: {
      ...obj?.attributes?.GHS,
    },
  };

  return {
    ...obj,
    rawMaterial: obj.rawMaterial
      ? rawMaterial : undefined,
    attributes: obj.attributes
      ? attrb : undefined,
  };
};

const sanitize = (obj: any) => cleanDeep(obj);
interface NormalizedLog {
  displayType: string;
  orig: any;
  idx: number;
  ts: number;
  type: string;
  values: any;
}


export const formatAuditLogs = (logsArray) => {
  const getTs = (log) => {
    const t =
      log.editedTimestamp ||
      log.createdTimestamp ||
      log.timestamp ||
      log.time;
    return t ? new Date(t).valueOf() : 0;
  };

  const parseLegacy = (str) => {
    if (!str || typeof str !== "string") return {};
    return str.split("|").reduce((acc, curr) => {
      const [key, ...rest] = curr.split("-");
      if (key) acc[key.trim()] = rest.join("-").trim();
      return acc;
    }, {});
  };

  const extractValues = (log) => {
    if (log.VALUES_BEFORE_EVENT || log.VALUES_AFTER_EVENT) {
      const str = log.VALUES_AFTER_EVENT || log.VALUES_BEFORE_EVENT;
      return parseLegacy(str);
    }
    return log;
  };
const handleBaselineDeleted = (
  curr,
  crafted,
  legacy,
  lastByType
) => {
  if (curr.orig?.operation !== "Baseline Deleted") {
    return false;
  }

  const summary = {
    assessmentId: curr.values.assessmentId,
    name: curr.values.name,
    operation: curr.orig.operation,
    operationType: curr.orig.operationType,
    createdTimestamp: curr.orig.createdTimestamp,
    editedTimestamp: curr.orig.editedTimestamp,
    createdBy: curr.orig.createdBy,
    editedBy: curr.orig.editedBy,
  };

  crafted.push({
    valueBefore: summary,
    valueAfter: {
      operation: curr.orig.operation,
      operationType: curr.orig.operationType,
      createdTimestamp: curr.orig.createdTimestamp,
      createdBy: curr.orig.createdBy,
    },
    legacy,
  });

  lastByType[curr.type] = curr;
  return true;
};
const handleBaselineChangeEvent = (
  curr,
  crafted,
  legacy,
  lastByType
) => {
  const prevSameType = lastByType[curr.type];

  const prevWasDeleteBoundary =
    prevSameType?.type === "delete" ||
    prevSameType?.displayType === "Delete" ||
    prevSameType?.orig?.operation === "Baseline Deleted";

  const sameBaselineLineage =
    prevSameType &&
    !prevWasDeleteBoundary &&
    prevSameType.values?.assessmentId &&
    curr.values?.assessmentId &&
    prevSameType.values.assessmentId === curr.values.assessmentId;

  if (
    handleBaselineDeleted(
      curr,
      crafted,
      legacy,
      lastByType
    )
  ) {
    return;
  }

  crafted.push({
    valueBefore: sameBaselineLineage
      ? prevSameType.values
      : null,
    valueAfter: curr.values,
    legacy,
  });

  lastByType[curr.type] = curr;
};

  const logs = logsArray
    .map((log, idx) => {
      const rawType =
        log.operationType ||
        log.operation ||
        log.eventType ||
        "UNKNOWN";

      const normalizedType =
        typeof rawType === "string"
          ? rawType.trim().toLowerCase()
          : "unknown";

      return {
        orig: log,
        idx,
        ts: getTs(log),
        type: normalizedType,
        displayType: rawType,
        values: extractValues(log),
      };
    })
    .sort((a, b) =>
      a.ts === b.ts ? a.idx - b.idx : a.ts - b.ts
    );


  const crafted = [];
  const lastByType: Record<string, NormalizedLog> = {};

  let firstUpdateHandled = false;

  logs.forEach((curr) => {
    const type = curr.type;
    const legacy = !!(
      curr.orig.VALUES_BEFORE_EVENT ||
      curr.orig.VALUES_AFTER_EVENT
    );
    // -----------------------------
    // INSERT → always standalone
    // -----------------------------
    if (type === "insert") {
      crafted.push({
        valueBefore: null,
        valueAfter: curr.values,
        legacy,
      });
      lastByType.insert = curr;
      return;
    }

    // ------------------------------------------------
    // FIRST UPDATE → compare with INSERT if possible
    // ------------------------------------------------
    if (type === "update" && !firstUpdateHandled) {
      const insertLog = lastByType.insert;

      if (
        insertLog 
      ) {
        crafted.push({
          valueBefore: insertLog.values,
          valueAfter: curr.values,
          legacy,
        });
      } else {
        crafted.push({
          valueBefore: null,
          valueAfter: curr.values,
          legacy,
        });
      }

      firstUpdateHandled = true;
      lastByType.update = curr;
      return;
    }

   if (type === "baseline change event") {
  handleBaselineChangeEvent(
    curr,
    crafted,
    legacy,
    lastByType
  );

  return;
}


    // ------------------------------------------------
    // FIRST occurrence of other special standalone types
    // ------------------------------------------------
    if (
      (type === "result change event" ||
        type === "method change event") &&
      !lastByType[type]
    ) {
      crafted.push({
        valueBefore: null,
        valueAfter: curr.values,
        legacy,
      });
      lastByType[type] = curr;
      return;
    }

    // ------------------------------------------------
    // Subsequent occurrences → compare with SAME type
    // ------------------------------------------------
    const prevSameType = lastByType[type];

    if (prevSameType) {
      crafted.push({
        valueBefore: prevSameType.values,
        valueAfter: curr.values,
        legacy,
      });
    } else {
      crafted.push({
        valueBefore: null,
        valueAfter: curr.values,
        legacy,
      });
    }

    lastByType[type] = curr;
  });

  // Newest first
  return crafted.reverse();
};


export const auditPdf = async (productSipId, res, isAssessment) => {
  try {
    const objectKey = productSipId;

    const rawReports = await getReportsForAuditReportFromPostgres(objectKey);

    const reports = rawReports.map((el: any) => {
      const records = el.get({ plain: true })?.records;

      return isAssessment === 'true'
        ? records
        : filterFields(records, sipReportConfig.jsonMaskDataFields);
    });
    reports.sort((a: any, b: any) => (
      (b.editedTimestamp
        ? new Date(b.editedTimestamp).valueOf() : new Date(b.createdTimestamp).valueOf())
      - (a.editedTimestamp
        ? new Date(a.editedTimestamp).valueOf() : new Date(a.createdTimestamp).valueOf())
    ));
    if (!reports.length) {
      return await res.status(httpStatus.badRequest).json(
        { status: { statusCode: '400', message: 'No data found' } }
      );
    }

    const craftedArray = formatAuditLogs(reports);
    const deltaArray = craftedArray?.map((changeLog: CraftedObject) => {
    const beforeValue = { ...(changeLog.valueBefore || {}) };
    const afterValue = { ...(changeLog.valueAfter || {}) };
      const toRemoveKeys = removedProps || [];
      toRemoveKeys.forEach((key) => {
        unset(beforeValue, key);
        unset(afterValue, key);
      });
      return diffString(
        sanitize(formatDateToGMTString(beforeValue)),
        sanitize(formatDateToGMTString(afterValue)),
        {
          outputKeys: ['objectKey'],
          color: false,
        },
      );
    });
    // eslint-disable-next-line new-cap
    const doc = new jsPDF('l', 'mm', [300, 350]);
    const heading = ` SIP Audit Trail Report. Generated by [" ${res.locals.user?.name || 'Test'} "] at [ ${getCETDate(new Date())} ] `;
    doc.setFontSize(14);
    doc.text(heading, 8, 12);
    const headKeys = ['Date', 'Operation', 'Event', 'Operator', 'Changes'];

    const isEmptyLine = (str: string) => (['+', '-', '', '+  _id:'].includes(str.trim()));

    const tableData = deltaArray.reduce((rowAcm, diffBlock, idx) => {
      // eslint-disable-next-line no-useless-escape
      const colorBlocks = diffBlock.split(/\r?\n/).map((i) => i.replace(/[{}]/g, '').replace(/[\\[\]]/g, ''))
        .filter((i) => !isEmptyLine(i));
        

      colorBlocks.forEach((col, idxx) => {
        if (idxx === 0) {
          if (craftedArray[idx].legacy) {
            rowAcm.push([
              reports[idx].editedTimestamp
                ? new Date(reports[idx].editedTimestamp).toUTCString().replace('GMT', 'CET')
                : new Date(reports[idx].createdTimestamp).toUTCString().replace('GMT', 'CET'),
              reports[idx].operation,
              reports[idx].operationType,
              reports[idx].editedBy
              || reports[idx].createdBy,
              col]);
          } else {
           const auditRecord =
            craftedArray[idx].valueAfter ||
            craftedArray[idx].valueBefore ||
            {};
          const timestamp =
            auditRecord.editedTimestamp || auditRecord.createdTimestamp;

          const auditDate = timestamp
            ? getCETDate(new Date(timestamp))
            : "";
          rowAcm.push([
            auditDate,
            auditRecord.operation || "",
            auditRecord.operationType || "",
            auditRecord.editedBy || auditRecord.createdBy || "",
            col,
          ]);
          }
        } else {
          rowAcm.push(['', '', '', '', col]);
        }
      });
      return rowAcm;
    }, <any>[]);
    const headLvl1 = [
      {
        content: `Audit Trail Report: ${objectKey}`,
        colSpan: headKeys.length,
        styles: {
          fillColor: 'silver',
        },
      },
    ];
    autoTable(doc, {
      theme: 'plain',

      bodyStyles: {
        cellPadding: 0,
        fontSize: 12,
      },
      startY: 18,
      body: [
        ['', '', '', 'Values Before', '', '', 'Values After'],
      ],
      columnStyles: {
        0: { cellWidth: 1 },
        1: { cellWidth: 10 },
        2: { cellWidth: 5 },
        3: { cellWidth: 75 },
        4: { cellWidth: 10 },
        5: { cellWidth: 5 },
      },
      willDrawCell: (hookData) => {
        if (hookData.section == 'body') {
          if (hookData.row.index === 0) {
            hookData.row.cells[1].styles.fillColor = 'red';
            hookData.row.cells[3].styles.textColor = 'red';

            hookData.row.cells[4].styles.fillColor = 'green';
            hookData.row.cells[6].styles.textColor = 'green';
          }
        }
      },
    });
    autoTable(doc, {
      head: [headLvl1, headKeys?.map((key) => formatLabel(key))],
      body: tableData,
      tableWidth: 300,
      theme: 'grid',
      startY: 30,
      headStyles: {
        textColor: 'black', lineWidth: 0.1, fillColor: 'silver', halign: 'center',
      },
      styles: {
        fillColor: 'white', lineColor: 'black', cellPadding: 0.5, overflow: 'linebreak',
      },
      tableLineWidth: 0.1,
      columnStyles: {
        0: { cellWidth: 80, halign: 'center' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
      },

      willDrawCell: (hookData) => {
        if (hookData.section == 'body') {
          if (hookData.row.cells[0].text[0] !== '') {
            hookData.cell.styles.lineWidth = {
              top: 0.1, right: 0.1, left: 0.1, bottom: 0,
            };
          } else {
            hookData.cell.styles.lineWidth = {
              top: 0, right: 0.1, left: 0.1, bottom: 0,
            };
          }
        }
        if (!hookData.cell?.text[0] || hookData.column.index !== 4) {
          return;
        }
        if (hookData.cell.text[0].startsWith('+')) {
          doc.setTextColor('green');
        } else if (hookData.cell.text[0].startsWith('-')) {
          doc.setTextColor('red');
        } else {
          doc.setTextColor('black');
        }
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const addFooters = (doc: any) => {
      const pageCount = doc.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setLineDashPattern([10], 10);
        doc.text('Kenvue Information Technology Confidential', 135, 287, {
          align: 'right',
        });
        doc.text(` Page ${String(i)} of ${String(pageCount)}`, doc.internal.pageSize.width - 50, 287, {
          align: 'left',
        });
      }
    };
    addFooters(doc);

    const fileData = doc.output();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SIPAuditTrailReport_${objectKey}_${new Date().toISOString()}.pdf`);
    res.write(fileData, 'binary');
    return res.end();
  } catch (err: unknown) {
    if ((err as Error).message) {
      return res.status(httpStatus.badRequest).json(
        { status: { statusCode: '400', message: (err as Error).message || 'Bad Request' } }
      );
    }
    return res.status(httpStatus.internalServerError).json({
      status: {
        statusCode: '500',
        message: (err as Error).stack,
      },
    });
  }
};