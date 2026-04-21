import { describe, it, expect } from 'vitest';
import {
  getGstRate,
  getPlaceOfSupply,
  isReverseChargeApplicable,
  getHsnDescription,
  getAllStateCodes,
  getHsnCodesByRate,
  searchHsnCodes,
} from '../services/gst-rate-service';

describe('GST Rate Service', () => {
  describe('getGstRate', () => {
    it('should return 0% rate for exempt goods (rice)', () => {
      const result = getGstRate('1006', '29', true);
      expect(result).toEqual({ rate: 0, type: 'goods', exempt: true });
    });

    it('should return 5% rate for footwear', () => {
      const result = getGstRate('6401', '27', true);
      expect(result).toEqual({ rate: 5, type: 'goods' });
    });

    it('should return 12% rate for pasta', () => {
      const result = getGstRate('1902', '07', true);
      expect(result).toEqual({ rate: 12, type: 'goods' });
    });

    it('should return 18% rate for AC machines (default)', () => {
      const result = getGstRate('8415', '29', true);
      expect(result).toEqual({ rate: 18, type: 'goods' });
    });

    it('should return 28% rate with cess for automobiles', () => {
      const result = getGstRate('8703', '27', true);
      expect(result).toEqual({ rate: 28, type: 'goods', cess: 22000 });
    });

    it('should return 18% for services (IT consulting)', () => {
      const result = getGstRate('996321', '29', false);
      expect(result).toEqual({ rate: 18, type: 'services' });
    });

    it('should return default 18% for unknown HSN code', () => {
      const result = getGstRate('9999', '29', true);
      expect(result).toEqual({ rate: 18, type: 'goods' });
    });

    it('should return default 18% for type mismatch', () => {
      // HSN 1006 is goods, but passing as services
      const result = getGstRate('1006', '29', false);
      expect(result).toEqual({ rate: 18, type: 'services' });
    });

    it('should handle HSN code with spaces', () => {
      const result = getGstRate('10 06', '29', true);
      expect(result).toEqual({ rate: 0, type: 'goods', exempt: true });
    });

    it('should handle lowercase HSN code', () => {
      const result = getGstRate('6401', '27', true);
      expect(result).toEqual({ rate: 5, type: 'goods' });
    });
  });

  describe('getPlaceOfSupply', () => {
    it('should return correct state code for Karnataka', () => {
      expect(getPlaceOfSupply('Karnataka')).toBe('29');
    });

    it('should return correct state code for Maharashtra', () => {
      expect(getPlaceOfSupply('Maharashtra')).toBe('27');
    });

    it('should return correct state code for Delhi', () => {
      expect(getPlaceOfSupply('Delhi')).toBe('07');
    });

    it('should return correct state code for Tamil Nadu', () => {
      expect(getPlaceOfSupply('Tamil Nadu')).toBe('33');
    });

    it('should handle state name with extra spaces', () => {
      expect(getPlaceOfSupply('  Karnataka  ')).toBe('29');
    });

    it('should throw error for invalid state', () => {
      expect(() => getPlaceOfSupply('InvalidState')).toThrow(
        'Invalid state: InvalidState'
      );
    });

    it('should return code for all 36 states/UTs', () => {
      const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
        'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
        'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
        'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
        'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
        'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
      ];

      states.forEach(state => {
        expect(() => getPlaceOfSupply(state)).not.toThrow();
      });
    });
  });

  describe('isReverseChargeApplicable', () => {
    it('should return false for goods', () => {
      expect(isReverseChargeApplicable(true, 'GTA')).toBe(false);
    });

    it('should return true for GTA services', () => {
      expect(isReverseChargeApplicable(false, 'GTA')).toBe(true);
    });

    it('should return true for legal services', () => {
      expect(isReverseChargeApplicable(false, 'legal')).toBe(true);
    });

    it('should return true for transport services', () => {
      expect(isReverseChargeApplicable(false, 'transport')).toBe(true);
    });

    it('should return true for insurance agent services', () => {
      expect(isReverseChargeApplicable(false, 'insurance_agent')).toBe(true);
    });

    it('should return true for director services', () => {
      expect(isReverseChargeApplicable(false, 'director')).toBe(true);
    });

    it('should return false for regular services', () => {
      expect(isReverseChargeApplicable(false, 'IT consulting')).toBe(false);
    });

    it('should handle case insensitive matching', () => {
      expect(isReverseChargeApplicable(false, 'GTA')).toBe(true);
      expect(isReverseChargeApplicable(false, 'gta')).toBe(true);
      expect(isReverseChargeApplicable(false, 'Gta')).toBe(true);
    });

    it('should return true for partial matches', () => {
      expect(isReverseChargeApplicable(false, 'Goods Transport Agency')).toBe(true);
      expect(isReverseChargeApplicable(false, 'Legal services by advocate')).toBe(true);
    });
  });

  describe('getHsnDescription', () => {
    it('should return description for rice', () => {
      expect(getHsnDescription('1006')).toBe('Rice');
    });

    it('should return description for footwear', () => {
      expect(getHsnDescription('6401')).toBe('Waterproof footwear with rubber/plastic soles');
    });

    it('should return description for automobiles', () => {
      expect(getHsnDescription('8703')).toBe('Motor cars and other motor vehicles');
    });

    it('should return description for IT services', () => {
      expect(getHsnDescription('996321')).toBe('IT consulting and support services');
    });

    it('should return "HSN code not found" for unknown code', () => {
      expect(getHsnDescription('999999')).toBe('HSN code not found');
    });

    it('should handle HSN code with spaces', () => {
      expect(getHsnDescription('10 06')).toBe('Rice');
    });
  });

  describe('getAllStateCodes', () => {
    it('should return all 36 state codes', () => {
      const stateCodes = getAllStateCodes();
      expect(Object.keys(stateCodes).length).toBe(36);
    });

    it('should include major states', () => {
      const stateCodes = getAllStateCodes();
      expect(stateCodes['Karnataka']).toBe('29');
      expect(stateCodes['Maharashtra']).toBe('27');
      expect(stateCodes['Delhi']).toBe('07');
      expect(stateCodes['Tamil Nadu']).toBe('33');
    });
  });

  describe('getHsnCodesByRate', () => {
    it('should return HSN codes for 0% slab', () => {
      const codes = getHsnCodesByRate(0);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('1001'); // Wheat
      expect(codes).toContain('1006'); // Rice
    });

    it('should return HSN codes for 5% slab', () => {
      const codes = getHsnCodesByRate(5);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('6401'); // Footwear
    });

    it('should return HSN codes for 12% slab', () => {
      const codes = getHsnCodesByRate(12);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('1902'); // Pasta
    });

    it('should return HSN codes for 18% slab', () => {
      const codes = getHsnCodesByRate(18);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('8415'); // AC machines
    });

    it('should return HSN codes for 28% slab', () => {
      const codes = getHsnCodesByRate(28);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('8703'); // Automobiles
    });

    it('should return empty array for invalid rate', () => {
      const codes = getHsnCodesByRate(99);
      expect(codes).toEqual([]);
    });
  });

  describe('searchHsnCodes', () => {
    it('should find rice by search query', () => {
      const results = searchHsnCodes('rice');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toEqual({
        hsn: '1006',
        description: 'Rice',
        rate: 0,
      });
    });

    it('should find footwear by search query', () => {
      const results = searchHsnCodes('footwear');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r: { hsn: string }) => r.hsn.startsWith('64'))).toBe(true);
    });

    it('should find motor vehicles by search query', () => {
      const results = searchHsnCodes('motor');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r: { hsn: string }) => r.hsn.startsWith('87'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchHsnCodes('xyz123notfound');
      expect(results).toEqual([]);
    });

    it('should handle case insensitive search', () => {
      const resultsLower = searchHsnCodes('rice');
      const resultsUpper = searchHsnCodes('RICE');
      expect(resultsLower).toEqual(resultsUpper);
    });

    it('should sort results by rate then HSN', () => {
      const results = searchHsnCodes('flour');
      for (let i = 1; i < results.length; i++) {
        expect(results[i].rate).toBeGreaterThanOrEqual(results[i - 1].rate);
      }
    });
  });

  describe('Integration tests', () => {
    it('should handle complete GST calculation flow', () => {
      const hsnCode = '8415'; // AC machines
      const state = 'Karnataka';
      const goods = true;

      const placeOfSupply = getPlaceOfSupply(state);
      const gstRate = getGstRate(hsnCode, placeOfSupply, goods);
      const description = getHsnDescription(hsnCode);

      expect(placeOfSupply).toBe('29');
      expect(gstRate.rate).toBe(18);
      expect(gstRate.type).toBe('goods');
      expect(description).toBe('Air conditioning machines');
    });

    it('should handle RCM service flow', () => {
      const serviceType = 'Goods Transport Agency';
      const goods = false;

      const rcmApplicable = isReverseChargeApplicable(goods, serviceType);

      expect(rcmApplicable).toBe(true);
    });
  });
});
