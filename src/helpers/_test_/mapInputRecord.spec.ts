import { projectMapping, assessmentBaseLineMapping } from '../mapInputRecord';

describe('mapInputRecord', () => {
  describe('projectMapping', () => {
    it('should map all top-level project fields correctly', () => {
      const input = {
        productSipId: 'SIP-001',
        productName: 'Test Product',
        brandName: 'Brand X',
        projectId: 'PROJ-001',
        projectName: 'Project Alpha',
        description: 'A test product description',
        shortBrandCode: 'BX',
        isDeleted: false,
        users: [{ name: 'Alice', role: 'Owner', mail: 'alice@test.com' }],
      };

      const result = projectMapping(input);

      expect(result.productSipId).toBe('SIP-001');
      expect(result.productName).toBe('Test Product');
      expect(result.brandName).toBe('Brand X');
      expect(result.projectId).toBe('PROJ-001');
      expect(result.projectName).toBe('Project Alpha');
      expect(result.description).toBe('A test product description');
      expect(result.shortBrandCode).toBe('BX');
      expect(result.isDeleted).toBe(false);
    });

    it('should map users array preserving name, role, and mail', () => {
      const input = {
        users: [
          { name: 'Alice', role: 'Owner', mail: 'alice@test.com' },
          { name: 'Bob', role: 'Member', mail: 'bob@test.com' },
        ],
      };

      const result = projectMapping(input);

      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toEqual({ name: 'Alice', role: 'Owner', mail: 'alice@test.com' });
      expect(result.users[1]).toEqual({ name: 'Bob', role: 'Member', mail: 'bob@test.com' });
    });

    it('should use empty string defaults for missing user name, role, and mail', () => {
      const input = {
        users: [{ name: undefined, role: null, mail: '' }],
      };

      const result = projectMapping(input);

      expect(result.users[0].name).toBe('');
      expect(result.users[0].role).toBe('');
      expect(result.users[0].mail).toBe('');
    });

    it('should return undefined users when users field is not present', () => {
      const result = projectMapping({ productSipId: 'SIP-002' });

      expect(result.users).toBeUndefined();
    });

    it('should handle null input without throwing', () => {
      const result = projectMapping(null);

      expect(result.productSipId).toBeUndefined();
    });

    it('should handle empty object input', () => {
      const result = projectMapping({});

      expect(result.productSipId).toBeUndefined();
      expect(result.users).toBeUndefined();
    });

    it('should return empty users array when users is an empty array', () => {
      const result = projectMapping({ users: [] });

      expect(result.users).toEqual([]);
    });
  });

  describe('assessmentBaseLineMapping', () => {
    it('should map all top-level assessment fields', () => {
      const input = {
        assessmentId: 'ASSESS-001',
        name: 'Baseline Assessment',
        isFormulationDataCompleted: true,
        isPackagingDataCompleted: false,
        isFormulationCalculated: true,
        isFormulationEOLCalculated: false,
        isBaselineCalcUpdated: true,
        isLPP: false,
        fg_spec: 'FG-001',
        formula_number: 'FML-001',
        lab_notebook_code: 'LNB-001',
        pc_spec: 'PC-SPEC-001',
        sku_erp_code: 'SKU-001',
        zone: 'EMEA',
        net_content: '250ml',
        createdBy: 'user1',
        modifiedBy: 'user2',
        formulation: { rawMaterials: [] },
        packaging_level: [],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.assessmentId).toBe('ASSESS-001');
      expect(result.name).toBe('Baseline Assessment');
      expect(result.isFormulationDataCompleted).toBe(true);
      expect(result.isPackagingDataCompleted).toBe(false);
      expect(result.isFormulationCalculated).toBe(true);
      expect(result.fg_spec).toBe('FG-001');
      expect(result.formula_number).toBe('FML-001');
      expect(result.zone).toBe('EMEA');
      expect(result.net_content).toBe('250ml');
      expect(result.createdBy).toBe('user1');
      expect(result.modifiedBy).toBe('user2');
    });

   it('should map calculation flags correctly', () => {
  const input = {
    isPackagingCalculated: true,
    isSpiceCalculated: true,
    isGreenChemistryCalculated: true,
    isSustainabilityPackagingCalculated: true,
    isLCACalculated: true,
    isGreenChemistryRollupCalculated: true,
    isSustainabilityPackagingRollupCalculated: true,
    isCalculatedButtonClicked: true,
    formulation: { rawMaterials: [] },
    packaging_level: [],
  };

  const result = assessmentBaseLineMapping(input);

  expect(result.isPackagingCalculated).toBe(true);
  expect(result.isSpiceCalculated).toBe(true);
  expect(result.isGreenChemistryCalculated).toBe(true);
  expect(result.isSustainabilityPackagingCalculated).toBe(true);
  expect(result.isLCACalculated).toBe(true);
  expect(result.isGreenChemistryRollupCalculated).toBe(true);
  expect(result.isSustainabilityPackagingRollupCalculated).toBe(true);
  expect(result.isCalculatedButtonClicked).toBe(true);
});

    it('should map formulation object fields', () => {
      const input = {
        formulation: {
          fmlCode: 'FML-001',
          description: 'Test formula',
          netContent: '200ml',
          netContentUnit: 'ml',
          productionZone: 'NA',
          salesZone: 'EMEA',
          productSegment: 'Hair',
          useDose: 10,
          rawMaterials: [],
        },
        packaging_level: [],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.formulation.fmlCode).toBe('FML-001');
      expect(result.formulation.description).toBe('Test formula');
      expect(result.formulation.netContent).toBe('200ml');
      expect(result.formulation.productionZone).toBe('NA');
      expect(result.formulation.salesZone).toBe('EMEA');
    });

    it('should map rawMaterials with correct fields', () => {
      const input = {
        formulation: {
          rawMaterials: [
            { tradeName: 'Material A', rawMaterialId: 'RM-001', percentage: 50 },
            { tradeName: 'Material B', rawMaterialId: 'RM-002', percentage: 50 },
          ],
        },
        packaging_level: [],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.formulation.rawMaterials).toHaveLength(2);
      expect(result.formulation.rawMaterials[0]).toEqual({
        tradeName: 'Material A',
        rawMaterialId: 'RM-001',
        percentage: 50,
      });
    });

    it('should use empty string defaults for missing rawMaterial fields', () => {
      const input = {
        formulation: {
          rawMaterials: [{ tradeName: undefined, rawMaterialId: undefined, percentage: undefined }],
        },
        packaging_level: [],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.formulation.rawMaterials[0]).toEqual({
        tradeName: '',
        rawMaterialId: '',
        percentage: '',
      });
    });

    it('should map packaging_level with top-level fields', () => {
      const input = {
        formulation: { rawMaterials: [] },
        packaging_level: [
          {
            packaging_level: 'Primary',
            isrecyclable: true,
            recyclability_status: 'Recyclable',
            productEvaluation: 'Good',
            isManualEdit: false,
            components: [],
          },
        ],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.packaging_level).toHaveLength(1);
      expect(result.packaging_level[0].packaging_level).toBe('Primary');
      expect(result.packaging_level[0].isrecyclable).toBe(true);
      expect(result.packaging_level[0].recyclability_status).toBe('Recyclable');
    });

    it('should map components inside packaging_level', () => {
      const input = {
        formulation: { rawMaterials: [] },
        packaging_level: [
          {
            packaging_level: 'Primary',
            components: [
              {
                pc_nm: 'PC-001',
                description: 'Test component',
                component_type: 'bottle',
                weight: '50g',
                opacifier: 'no',
                recyclability_status: 'Yes',
                stage: 'prod',
                state: 'active',
                template: 'default',
                isEdited: false,
                isDataComplete: true,
                isCalculated: false,
                sub_components: [],
              },
            ],
          },
        ],
      };

      const result = assessmentBaseLineMapping(input);

      const component = result.packaging_level[0].components[0];
      expect(component.pc_nm).toBe('PC-001');
      expect(component.description).toBe('Test component');
      expect(component.component_type).toBe('bottle');
      expect(component.weight).toBe('50g');
    });

    it('should map sub_components with material array', () => {
      const input = {
        formulation: { rawMaterials: [] },
        packaging_level: [
          {
            packaging_level: 'Primary',
            components: [
              {
                pc_nm: 'PC-001',
                sub_components: [
                  {
                    name: 'Sub1',
                    opacity: 'transparent',
                    color: 'clear',
                    finishing_process: 'matte',
                    material: [
                      {
                        material_name: 'HDPE',
                        material_type: 'Plastic',
                        layer: '1',
                        converting_process: 'blow',
                        material_pct: '100',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = assessmentBaseLineMapping(input);

      const subComp = result.packaging_level[0].components[0].sub_components[0];
      expect(subComp.name).toBe('Sub1');
      expect(subComp.opacity).toBe('transparent');
      expect(subComp.color).toBe('clear');
      expect(subComp.finishing_process).toBe('matte');
      expect(subComp.material[0].material_name).toBe('HDPE');
      expect(subComp.material[0].material_pct).toBe('100');
    });

    it('should use empty string defaults for missing component fields', () => {
      const input = {
        formulation: { rawMaterials: [] },
        packaging_level: [
          {
            packaging_level: undefined,
            components: [
              {
                pc_nm: undefined,
                sub_components: [],
              },
            ],
          },
        ],
      };

      const result = assessmentBaseLineMapping(input);

      expect(result.packaging_level[0].packaging_level).toBe('');
      expect(result.packaging_level[0].components[0].pc_nm).toBe('');
    });

    it('should handle empty packaging_level array', () => {
      const input = { formulation: { rawMaterials: [] }, packaging_level: [] };

      const result = assessmentBaseLineMapping(input);

      expect(result.packaging_level).toHaveLength(0);
    });

it('should handle undefined input gracefully', () => {
  const result = assessmentBaseLineMapping({});

  expect(result.assessmentId).toBeUndefined();
  expect(result.formulation?.rawMaterials ?? []).toEqual([]);
  expect(result.packaging_level ?? []).toEqual([]);
});
    it('should map baseline skip fields', () => {
  const input = {
    assessmentId: 'ASSESS-001',
    name: 'Baseline Assessment',
    isBaselineSkipped: true,
    justification: 'Data not available',
    formulation: { rawMaterials: [] },
    packaging_level: [],
  };

  const result = assessmentBaseLineMapping(input);

  expect(result.isBaselineSkipped).toBe(true);
  expect(result.justification).toBe('Data not available');
});
  });
});
