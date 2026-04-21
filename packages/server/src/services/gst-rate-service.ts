/**
 * GST Rate Service
 * 
 * Provides GST rate lookup by HSN code, place of supply mapping,
 * and reverse charge mechanism (RCM) applicability checks.
 * 
 * Reference: CBIC GST Rates, Indian State Codes
 */

// Indian State Codes (Place of Supply)
const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
  'Andaman and Nicobar Islands': '35',
  'Chandigarh': '04',
  'Dadra and Nagar Haveli and Daman and Diu': '26',
  'Delhi': '07',
  'Jammu and Kashmir': '01',
  'Ladakh': '38',
  'Lakshadweep': '31',
  'Puducherry': '34',
};

// HSN Code Mappings (~50 common codes across GST slabs)
const HSN_MAPPINGS: Record<
  string,
  { description: string; rate: number; type: 'goods' | 'services'; cess?: number; exempt?: boolean }
> = {
  // 0% - Exempt
  '1001': { description: 'Wheat and meslin', rate: 0, type: 'goods', exempt: true },
  '1002': { description: 'Rye, barley and oats', rate: 0, type: 'goods', exempt: true },
  '1005': { description: 'Maize (corn)', rate: 0, type: 'goods', exempt: true },
  '1006': { description: 'Rice', rate: 0, type: 'goods', exempt: true },
  '1007': { description: 'Grain sorghum', rate: 0, type: 'goods', exempt: true },
  '1101': { description: 'Wheat or meslin flour', rate: 0, type: 'goods', exempt: true },
  '1102': { description: 'Cereal flour (other than wheat)', rate: 0, type: 'goods', exempt: true },
  '5001': { description: 'Silk-worm cocoons suitable for reeling', rate: 0, type: 'goods', exempt: true },
  '5002': { description: 'Raw silk', rate: 0, type: 'goods', exempt: true },
  '5003': { description: 'Silk waste', rate: 0, type: 'goods', exempt: true },
  '8713': { description: 'Carriages for disabled persons', rate: 0, type: 'goods', exempt: true },
  
  // 5% Slab
  '1104': { description: 'Cereal grains (hulled, rolled, flaked, etc.)', rate: 5, type: 'goods' },
  '1105': { description: 'Flour, meal, powder of potatoes', rate: 5, type: 'goods' },
  '1106': { description: 'Flour of sago, roots, tubers', rate: 5, type: 'goods' },
  '1107': { description: 'Malt (roasted or not)', rate: 5, type: 'goods' },
  '1108': { description: 'Starches; inulin', rate: 5, type: 'goods' },
  '1701': { description: 'Cane or beet sugar, raw', rate: 5, type: 'goods' },
  '1702': { description: 'Other sugars; sugar syrups', rate: 5, type: 'goods' },
  '2101': { description: 'Coffee, tea extracts and preparations', rate: 5, type: 'goods' },
  '2102': { description: 'Yeasts; baking powders', rate: 5, type: 'goods' },
  '2103': { description: 'Sauces and preparations; mixed condiments', rate: 5, type: 'goods' },
  '2104': { description: 'Soups and broths', rate: 5, type: 'goods' },
  '2105': { description: 'Ice cream and other edible ice', rate: 5, type: 'goods' },
  '2106': { description: 'Food preparations n.e.c.', rate: 5, type: 'goods' },
  '2201': { description: 'Waters, including mineral waters', rate: 5, type: 'goods' },
  '2202': { description: 'Waters, including soft drinks', rate: 5, type: 'goods' },
  '2210': { description: 'Kombucha and other fermented beverages', rate: 5, type: 'goods' },
  '3001': { description: 'Glands and organs for organotherapeutic uses', rate: 5, type: 'goods' },
  '3002': { description: 'Human blood; animal blood for therapeutic uses', rate: 5, type: 'goods' },
  '3003': { description: 'Medicaments (not put up for retail sale)', rate: 5, type: 'goods' },
  '3004': { description: 'Medicaments (put up for retail sale)', rate: 5, type: 'goods' },
  '3005': { description: 'Wadding, gauze, bandages', rate: 5, type: 'goods' },
  '3006': { description: 'Pharmaceutical goods', rate: 5, type: 'goods' },
  '4012': { description: 'Retreaded pneumatic tyres', rate: 5, type: 'goods' },
  '4401': { description: 'Fuel wood, in logs, billets, twigs', rate: 5, type: 'goods' },
  '4402': { description: 'Wood charcoal', rate: 5, type: 'goods' },
  '6401': { description: 'Waterproof footwear with rubber/plastic soles', rate: 5, type: 'goods' },
  '6402': { description: 'Other footwear with rubber/plastic soles', rate: 5, type: 'goods' },
  '6403': { description: 'Footwear with leather soles', rate: 5, type: 'goods' },
  '6404': { description: 'Footwear with textile soles', rate: 5, type: 'goods' },
  '6405': { description: 'Other footwear', rate: 5, type: 'goods' },
  '8501': { description: 'Electric motors and generators', rate: 5, type: 'goods' },
  '8502': { description: 'Electric generating sets', rate: 5, type: 'goods' },
  '8504': { description: 'Electrical transformers, static converters', rate: 5, type: 'goods' },
  '8506': { description: 'Primary cells and primary batteries', rate: 5, type: 'goods' },
  '8507': { description: 'Electric accumulators', rate: 5, type: 'goods' },
  
  // 12% Slab
  '1601': { description: 'Sausages and similar products', rate: 12, type: 'goods' },
  '1602': { description: 'Other prepared or preserved meat', rate: 12, type: 'goods' },
  '1603': { description: 'Extracts and juices of meat, fish', rate: 12, type: 'goods' },
  '1604': { description: 'Prepared or preserved fish', rate: 12, type: 'goods' },
  '1605': { description: 'Crustaceans, molluscs prepared/preserved', rate: 12, type: 'goods' },
  '1901': { description: 'Malt extract; food preparations of flour', rate: 12, type: 'goods' },
  '1902': { description: 'Pasta, whether or not cooked', rate: 12, type: 'goods' },
  '1903': { description: 'Tapioca and substitutes', rate: 12, type: 'goods' },
  '1904': { description: 'Prepared foods obtained by swelling/roasting', rate: 12, type: 'goods' },
  '1905': { description: 'Bread, pastry, cakes, biscuits', rate: 12, type: 'goods' },
  '2001': { description: 'Vegetables, fruit, nuts prepared in vinegar', rate: 12, type: 'goods' },
  '2002': { description: 'Tomatoes prepared/preserved otherwise', rate: 12, type: 'goods' },
  '2003': { description: 'Mushrooms and truffles', rate: 12, type: 'goods' },
  '2004': { description: 'Other vegetables prepared/preserved', rate: 12, type: 'goods' },
  '2005': { description: 'Other vegetables prepared/preserved (not frozen)', rate: 12, type: 'goods' },
  '2006': { description: 'Vegetables, fruit, nuts preserved by sugar', rate: 12, type: 'goods' },
  '2007': { description: 'Jams, fruit jellies, marmalades', rate: 12, type: 'goods' },
  '2008': { description: 'Fruit, nuts otherwise prepared/preserved', rate: 12, type: 'goods' },
  '2009': { description: 'Fruit juices and vegetable juices', rate: 12, type: 'goods' },
  '2107': { description: 'Food preparations n.e.c. (protein concentrates)', rate: 12, type: 'goods' },
  '2203': { description: 'Beer made from malt', rate: 12, type: 'goods' },
  '2204': { description: 'Wine of fresh grapes', rate: 12, type: 'goods' },
  '2205': { description: 'Vermouth and other flavored wine', rate: 12, type: 'goods' },
  '2206': { description: 'Other fermented beverages', rate: 12, type: 'goods' },
  '2207': { description: 'Undenatured ethyl alcohol', rate: 12, type: 'goods' },
  '2208': { description: 'Undenatured ethyl alcohol, spirits', rate: 12, type: 'goods' },
  '2209': { description: 'Vinegar and substitutes', rate: 12, type: 'goods' },
  '2301': { description: 'Flours, meals of meat, offal, fish', rate: 12, type: 'goods' },
  '2302': { description: 'Bran, sharps and other residues', rate: 12, type: 'goods' },
  '2303': { description: 'Residues of starch manufacture', rate: 12, type: 'goods' },
  '2304': { description: 'Oil-cake and other solid residues (soya)', rate: 12, type: 'goods' },
  '2305': { description: 'Oil-cake and other solid residues (groundnuts)', rate: 12, type: 'goods' },
  '2306': { description: 'Oil-cake and other solid residues (other)', rate: 12, type: 'goods' },
  '2307': { description: 'Wine lees; argol', rate: 12, type: 'goods' },
  '2308': { description: 'Vegetable materials and vegetable waste', rate: 12, type: 'goods' },
  '2309': { description: 'Preparations of a kind used in animal feeding', rate: 12, type: 'goods' },
  '2401': { description: 'Unmanufactured tobacco; tobacco refuse', rate: 12, type: 'goods' },
  '2402': { description: 'Cigars, cheroots, cigarillos and cigarettes', rate: 12, type: 'goods' },
  '2403': { description: 'Other manufactured tobacco', rate: 12, type: 'goods' },
  '2501': { description: 'Salt (including table salt and denatured salt)', rate: 12, type: 'goods' },
  '2502': { description: 'Unroasted iron pyrites', rate: 12, type: 'goods' },
  '2503': { description: 'Sulphur of all kinds', rate: 12, type: 'goods' },
  '2504': { description: 'Natural graphite', rate: 12, type: 'goods' },
  '2505': { description: 'Natural sands of all kinds', rate: 12, type: 'goods' },
  '2506': { description: 'Quartz, quartzite', rate: 12, type: 'goods' },
  '2507': { description: 'Kaolin and other kaolinic clays', rate: 12, type: 'goods' },
  '2508': { description: 'Other clays, andalusite, kyanite and sillimanite', rate: 12, type: 'goods' },
  '2509': { description: 'Chalk', rate: 12, type: 'goods' },
  '2510': { description: 'Natural calcium phosphates, natural aluminium', rate: 12, type: 'goods' },
  '2511': { description: 'Natural barium sulphate (barytes)', rate: 12, type: 'goods' },
  '2512': { description: 'Siliceous fossil meals', rate: 12, type: 'goods' },
  '2513': { description: 'Pumice stone; emery; natural corundum', rate: 12, type: 'goods' },
  '2514': { description: 'Slate, whether or not roughly trimmed', rate: 12, type: 'goods' },
  '2515': { description: 'Marble, travertine, ecaussine', rate: 12, type: 'goods' },
  '2516': { description: 'Granite, porphyry, basalt, sandstone', rate: 12, type: 'goods' },
  '2517': { description: 'Pebbles, gravel, broken or crushed stone', rate: 12, type: 'goods' },
  '2518': { description: 'Dolomite, whether or not calcined', rate: 12, type: 'goods' },
  '2519': { description: 'Natural magnesium carbonate (magnesite)', rate: 12, type: 'goods' },
  '2520': { description: 'Gypsum; anhydrite; plasters', rate: 12, type: 'goods' },
  '2521': { description: 'Limestone flux; limestone and calcareous stone', rate: 12, type: 'goods' },
  '2522': { description: 'Quicklime, slaked lime and hydraulic lime', rate: 12, type: 'goods' },
  '2523': { description: 'Portland cement, aluminous cement', rate: 12, type: 'goods' },
  '2524': { description: 'Asbestos', rate: 12, type: 'goods' },
  '2525': { description: 'Mica, including splittings', rate: 12, type: 'goods' },
  '2526': { description: 'Natural steatite', rate: 12, type: 'goods' },
  '2528': { description: 'Natural borates and concentrates', rate: 12, type: 'goods' },
  '2529': { description: 'Feldspar; leucite; nepheline and nepheline', rate: 12, type: 'goods' },
  '2530': { description: 'Mineral substances n.e.c.', rate: 12, type: 'goods' },
  
  // 18% Slab (Default)
  '8401': { description: 'Nuclear reactors; fuel elements', rate: 18, type: 'goods' },
  '8402': { description: 'Vapor generating boilers', rate: 18, type: 'goods' },
  '8403': { description: 'Central heating boilers', rate: 18, type: 'goods' },
  '8404': { description: 'Auxiliary plant for boilers', rate: 18, type: 'goods' },
  '8405': { description: 'Producer gas generators', rate: 18, type: 'goods' },
  '8406': { description: 'Steam turbines and other vapor turbines', rate: 18, type: 'goods' },
  '8407': { description: 'Spark-ignition reciprocating engines', rate: 18, type: 'goods' },
  '8408': { description: 'Compression-ignition engines (diesel)', rate: 18, type: 'goods' },
  '8409': { description: 'Parts suitable for engines', rate: 18, type: 'goods' },
  '8410': { description: 'Hydraulic turbines and water wheels', rate: 18, type: 'goods' },
  '8411': { description: 'Turbojets, turbopropellers and other gas turbines', rate: 18, type: 'goods' },
  '8412': { description: 'Other engines and motors', rate: 18, type: 'goods' },
  '8413': { description: 'Pumps for liquids', rate: 18, type: 'goods' },
  '8414': { description: 'Air or vacuum pumps, compressors', rate: 18, type: 'goods' },
  '8415': { description: 'Air conditioning machines', rate: 18, type: 'goods' },
  '8416': { description: 'Furnace burners for liquid fuel', rate: 18, type: 'goods' },
  '8417': { description: 'Industrial or laboratory furnaces and ovens', rate: 18, type: 'goods' },
  '8418': { description: 'Refrigerators, freezers and other refrigerating', rate: 18, type: 'goods' },
  '8419': { description: 'Machinery for treatment of materials', rate: 18, type: 'goods' },
  '8420': { description: 'Calendering or other rolling machines', rate: 18, type: 'goods' },
  '8421': { description: 'Centrifuges; filtering/purifying machinery', rate: 18, type: 'goods' },
  '8422': { description: 'Dish washing machines; packing/wrapping machinery', rate: 18, type: 'goods' },
  '8423': { description: 'Weighing machinery', rate: 18, type: 'goods' },
  '8424': { description: 'Mechanical appliances for projecting/dispersing', rate: 18, type: 'goods' },
  '8425': { description: 'Pulley tackle and hoists', rate: 18, type: 'goods' },
  '8426': { description: "Ships' derricks; cranes", rate: 18, type: 'goods' },
  '8427': { description: 'Fork-lift trucks; other works trucks', rate: 18, type: 'goods' },
  '8428': { description: 'Other lifting, handling, loading/unloading', rate: 18, type: 'goods' },
  '8429': { description: 'Self-propelled bulldozers, graders, scrapers', rate: 18, type: 'goods' },
  '8430': { description: 'Other moving, grading, leveling, excavating', rate: 18, type: 'goods' },
  '8431': { description: 'Parts suitable for machinery', rate: 18, type: 'goods' },
  '8432': { description: 'Agricultural, horticultural or forestry machinery', rate: 18, type: 'goods' },
  '8433': { description: 'Harvesting or threshing machinery', rate: 18, type: 'goods' },
  '8434': { description: 'Milking machines and dairy machinery', rate: 18, type: 'goods' },
  '8435': { description: 'Presses, crushers for wine, cider, fruit juices', rate: 18, type: 'goods' },
  '8436': { description: 'Other agricultural, horticultural machinery', rate: 18, type: 'goods' },
  '8437': { description: 'Machines for cleaning, sorting agricultural seeds', rate: 18, type: 'goods' },
  '8438': { description: 'Machinery for industrial preparation of food', rate: 18, type: 'goods' },
  '8439': { description: 'Machinery for making pulp of fibrous cellulosic', rate: 18, type: 'goods' },
  '8440': { description: 'Book-binding machinery', rate: 18, type: 'goods' },
  '8441': { description: 'Other machinery for making up paper pulp', rate: 18, type: 'goods' },
  '8442': { description: 'Machinery, apparatus for type founding', rate: 18, type: 'goods' },
  '8443': { description: 'Printing machinery', rate: 18, type: 'goods' },
  '8444': { description: 'Machines for extruding textile materials', rate: 18, type: 'goods' },
  '8445': { description: 'Machines for preparing textile fibers', rate: 18, type: 'goods' },
  '8446': { description: 'Weaving machines', rate: 18, type: 'goods' },
  '8447': { description: 'Knitting machines, stitch-bonding', rate: 18, type: 'goods' },
  '8448': { description: 'Auxiliary machinery for textile machines', rate: 18, type: 'goods' },
  '8449': { description: 'Machinery for manufacturing felt', rate: 18, type: 'goods' },
  '8450': { description: 'Household or laundry-type washing machines', rate: 18, type: 'goods' },
  '8451': { description: 'Machinery for washing, cleaning, wringing', rate: 18, type: 'goods' },
  '8452': { description: 'Sewing machines', rate: 18, type: 'goods' },
  '8453': { description: 'Machinery for preparing, tanning or working hides', rate: 18, type: 'goods' },
  '8454': { description: 'Converters, ladles, ingot molds, casting machines', rate: 18, type: 'goods' },
  '8455': { description: 'Metal-rolling mills and rolls therefor', rate: 18, type: 'goods' },
  '8456': { description: 'Machine tools working by laser, water-jet', rate: 18, type: 'goods' },
  '8457': { description: 'Machining centers, unit construction machines', rate: 18, type: 'goods' },
  '8458': { description: 'Lathes for removing metal', rate: 18, type: 'goods' },
  '8459': { description: 'Machine tools for boring, milling, threading metal', rate: 18, type: 'goods' },
  '8460': { description: 'Machine tools for deburring, polishing metal', rate: 18, type: 'goods' },
  '8461': { description: 'Machine tools for planing, shaping, slotting metal', rate: 18, type: 'goods' },
  '8462': { description: 'Machine tools for working metal by forging', rate: 18, type: 'goods' },
  '8463': { description: 'Other machine tools for working metal', rate: 18, type: 'goods' },
  '8464': { description: 'Machine tools for working stone, ceramics, glass', rate: 18, type: 'goods' },
  '8465': { description: 'Machine tools for working wood, cork, bone', rate: 18, type: 'goods' },
  '8466': { description: 'Parts and accessories for machine tools', rate: 18, type: 'goods' },
  '8467': { description: 'Tools for working in the hand, pneumatic, hydraulic', rate: 18, type: 'goods' },
  '8468': { description: 'Machinery and apparatus for soldering, brazing', rate: 18, type: 'goods' },
  '8469': { description: 'Typewriters and word processing machines', rate: 18, type: 'goods' },
  '8470': { description: 'Calculating machines and pocket-size data', rate: 18, type: 'goods' },
  '8471': { description: 'Automatic data processing machines and units', rate: 18, type: 'goods' },
  '8472': { description: 'Other office machines', rate: 18, type: 'goods' },
  '8473': { description: 'Parts and accessories for office machines', rate: 18, type: 'goods' },
  '8474': { description: 'Machinery for sorting, screening, separating', rate: 18, type: 'goods' },
  '8475': { description: 'Machines for assembling electric/electronic lamps', rate: 18, type: 'goods' },
  '8476': { description: 'Automatic goods-vending machines', rate: 18, type: 'goods' },
  '8477': { description: 'Machinery for working rubber or plastics', rate: 18, type: 'goods' },
  '8478': { description: 'Machinery for preparing, making up tobacco', rate: 18, type: 'goods' },
  '8479': { description: 'Machines and mechanical appliances having individual', rate: 18, type: 'goods' },
  '8480': { description: 'Molding boxes for metal foundry; molds', rate: 18, type: 'goods' },
  '8481': { description: 'Taps, cocks, valves and similar appliances', rate: 18, type: 'goods' },
  '8482': { description: 'Ball or roller bearings', rate: 18, type: 'goods' },
  '8483': { description: 'Transmission shafts, cranks, bearing housings', rate: 18, type: 'goods' },
  '8484': { description: 'Gaskets and similar joints of metal sheeting', rate: 18, type: 'goods' },
  '8485': { description: 'Machinery parts, not specified elsewhere', rate: 18, type: 'goods' },
  '8486': { description: 'Machines and apparatus for manufacturing semiconductors', rate: 18, type: 'goods' },
  '8487': { description: 'Machinery parts, not specified elsewhere (nuclear)', rate: 18, type: 'goods' },
  
  // 28% Slab (with cess)
  '2701': { description: 'Coal; briquettes, ovoids and similar solid fuels', rate: 28, type: 'goods', cess: 200 },
  '2702': { description: 'Lignite, whether or not agglomerated', rate: 28, type: 'goods', cess: 150 },
  '2703': { description: 'Peat (including peat litter)', rate: 28, type: 'goods', cess: 100 },
  '2704': { description: 'Coke and semi-coke of coal, lignite or peat', rate: 28, type: 'goods', cess: 200 },
  '2705': { description: 'Coal gas, water gas, producer gas', rate: 28, type: 'goods', cess: 50 },
  '2706': { description: 'Tar distilled from coal, lignite or peat', rate: 28, type: 'goods', cess: 100 },
  '2707': { description: 'Oils and other products of high temperature coal tar', rate: 28, type: 'goods', cess: 150 },
  '2708': { description: 'Pitch and pitch coke, obtained from coal tar', rate: 28, type: 'goods', cess: 100 },
  '2709': { description: 'Petroleum oils and oils obtained from bituminous', rate: 28, type: 'goods', cess: 500 },
  '2710': { description: 'Petroleum oils and oils obtained from bituminous', rate: 28, type: 'goods', cess: 400 },
  '2711': { description: 'Petroleum gases and other gaseous hydrocarbons', rate: 28, type: 'goods', cess: 300 },
  '2712': { description: 'Petroleum jelly; paraffin wax', rate: 28, type: 'goods', cess: 100 },
  '2713': { description: 'Petroleum coke, petroleum bitumen', rate: 28, type: 'goods', cess: 200 },
  '2714': { description: 'Bitumen and asphalt, natural; bituminous shale', rate: 28, type: 'goods', cess: 150 },
  '2715': { description: 'Bituminous mixtures based on natural asphalt', rate: 28, type: 'goods', cess: 100 },
  '2716': { description: 'Electrical energy', rate: 28, type: 'goods', cess: 0 },
  '8701': { description: 'Tractors (other than tractors of heading 8709)', rate: 28, type: 'goods', cess: 22000 },
  '8702': { description: 'Motor vehicles for transport of 10+ persons', rate: 28, type: 'goods', cess: 22000 },
  '8703': { description: 'Motor cars and other motor vehicles', rate: 28, type: 'goods', cess: 22000 },
  '8704': { description: 'Motor vehicles for transport of goods', rate: 28, type: 'goods', cess: 22000 },
  '8705': { description: 'Special purpose motor vehicles', rate: 28, type: 'goods', cess: 22000 },
  '8706': { description: 'Chassis fitted with engines, for motor vehicles', rate: 28, type: 'goods', cess: 22000 },
  '8707': { description: 'Bodies (including cabs), for motor vehicles', rate: 28, type: 'goods', cess: 22000 },
  '8708': { description: 'Parts and accessories of motor vehicles', rate: 28, type: 'goods', cess: 22000 },
  '8709': { description: 'Works trucks, self-propelled', rate: 28, type: 'goods', cess: 12000 },
  '8710': { description: 'Tanks and other armoured fighting vehicles', rate: 28, type: 'goods', cess: 0 },
  '8711': { description: 'Motorcycles (including mopeds)', rate: 28, type: 'goods', cess: 12000 },
  '8712': { description: 'Bicycles and other cycles (not motorized)', rate: 28, type: 'goods', cess: 0 },
  '8714': { description: 'Parts and accessories of cycles', rate: 28, type: 'goods', cess: 0 },
  '8715': { description: 'Baby carriages and parts thereof', rate: 28, type: 'goods', cess: 0 },
  '8716': { description: 'Trailers and semi-trailers; other vehicles', rate: 28, type: 'goods', cess: 12000 },
  
  // Services
  '996311': { description: 'Research and experimental development services', rate: 18, type: 'services' },
  '996312': { description: 'Legal services', rate: 18, type: 'services' },
  '996313': { description: 'Accounting, auditing and bookkeeping services', rate: 18, type: 'services' },
  '996314': { description: 'Architectural services', rate: 18, type: 'services' },
  '996315': { description: 'Engineering services', rate: 18, type: 'services' },
  '996316': { description: 'Design services', rate: 18, type: 'services' },
  '996321': { description: 'IT consulting and support services', rate: 18, type: 'services' },
  '996322': { description: 'IT design and development services', rate: 18, type: 'services' },
  '996323': { description: 'Hosting and IT infrastructure provisioning', rate: 18, type: 'services' },
  '996324': { description: 'IT infrastructure and network management', rate: 18, type: 'services' },
  '996325': { description: 'IT support and other services', rate: 18, type: 'services' },
  '996326': { description: 'IT infrastructure and network management', rate: 18, type: 'services' },
  '996331': { description: 'Advertising services', rate: 18, type: 'services' },
  '996332': { description: 'Market research services', rate: 18, type: 'services' },
  '996333': { description: 'Public relations services', rate: 18, type: 'services' },
  '996334': { description: 'Photographic services', rate: 18, type: 'services' },
  '996335': { description: 'Translation and interpretation services', rate: 18, type: 'services' },
  '996336': { description: 'Business and management consultancy services', rate: 18, type: 'services' },
  '996337': { description: 'Management consulting services', rate: 18, type: 'services' },
  '996338': { description: 'Technical testing and analysis services', rate: 18, type: 'services' },
  '996339': { description: 'Other professional, technical and business', rate: 18, type: 'services' },
  '996411': { description: 'Telephony services', rate: 18, type: 'services' },
  '996412': { description: 'Transmission services', rate: 18, type: 'services' },
  '996413': { description: 'Internet access services', rate: 18, type: 'services' },
  '996414': { description: 'Data transmission services', rate: 18, type: 'services' },
  '996415': { description: 'Leased circuit capacity services', rate: 18, type: 'services' },
  '996416': { description: 'Teleconferencing services', rate: 18, type: 'services' },
  '996419': { description: 'Other telecommunications services', rate: 18, type: 'services' },
  '996511': { description: 'Postal services', rate: 18, type: 'services' },
  '996512': { description: 'Courier services', rate: 18, type: 'services' },
  '996519': { description: 'Other postal and courier services', rate: 18, type: 'services' },
  '996611': { description: 'Financial intermediation services', rate: 18, type: 'services' },
  '996612': { description: 'Investment banking services', rate: 18, type: 'services' },
  '996613': { description: 'Portfolio management services', rate: 18, type: 'services' },
  '996619': { description: 'Other financial services', rate: 18, type: 'services' },
  '996711': { description: 'Insurance services', rate: 18, type: 'services' },
  '996712': { description: 'Reinsurance services', rate: 18, type: 'services' },
  '996713': { description: 'Pension funding services', rate: 18, type: 'services' },
  '996719': { description: 'Other insurance and pension funding', rate: 18, type: 'services' },
  '997111': { description: 'Rental services of automobiles', rate: 18, type: 'services' },
  '997112': { description: 'Rental services of commercial vehicles', rate: 18, type: 'services' },
  '997113': { description: 'Rental services of motorcycles', rate: 18, type: 'services' },
  '997114': { description: 'Rental services of bicycles', rate: 18, type: 'services' },
  '997115': { description: 'Rental services of other transport equipment', rate: 18, type: 'services' },
  '997119': { description: 'Other rental services of transport equipment', rate: 18, type: 'services' },
  '997211': { description: 'Leasing services of residential buildings', rate: 18, type: 'services' },
  '997212': { description: 'Leasing services of non-residential buildings', rate: 18, type: 'services' },
  '997213': { description: 'Leasing services of land', rate: 18, type: 'services' },
  '997219': { description: 'Other leasing services', rate: 18, type: 'services' },
  '997311': { description: 'Licensing services for right to use computer', rate: 18, type: 'services' },
  '997312': { description: 'Licensing services for right to use software', rate: 18, type: 'services' },
  '997313': { description: 'Licensing services for right to use intellectual', rate: 18, type: 'services' },
  '997314': { description: 'Licensing services for right to use other', rate: 18, type: 'services' },
  '997319': { description: 'Other licensing services', rate: 18, type: 'services' },
  '998111': { description: 'Education services - pre-primary', rate: 18, type: 'services' },
  '998112': { description: 'Education services - primary', rate: 18, type: 'services' },
  '998113': { description: 'Education services - secondary', rate: 18, type: 'services' },
  '998114': { description: 'Education services - higher', rate: 18, type: 'services' },
  '998115': { description: 'Education services - adult', rate: 18, type: 'services' },
  '998116': { description: 'Education services - other', rate: 18, type: 'services' },
  '998211': { description: 'Health services - general', rate: 18, type: 'services' },
  '998212': { description: 'Health services - specialist', rate: 18, type: 'services' },
  '998213': { description: 'Health services - dental', rate: 18, type: 'services' },
  '998214': { description: 'Health services - veterinary', rate: 18, type: 'services' },
  '998215': { description: 'Health services - paramedical', rate: 18, type: 'services' },
  '998216': { description: 'Health services - other', rate: 18, type: 'services' },
  '998311': { description: 'Community services - residential', rate: 18, type: 'services' },
  '998312': { description: 'Community services - non-residential', rate: 18, type: 'services' },
  '998313': { description: 'Community services - vocational rehab', rate: 18, type: 'services' },
  '998314': { description: 'Community services - child day-care', rate: 18, type: 'services' },
  '998315': { description: 'Community services - other', rate: 18, type: 'services' },
  '998411': { description: 'Sporting services - professional', rate: 18, type: 'services' },
  '998412': { description: 'Sporting services - recreational', rate: 18, type: 'services' },
  '998413': { description: 'Sporting services - facility operation', rate: 18, type: 'services' },
  '998414': { description: 'Sporting services - other', rate: 18, type: 'services' },
  '998511': { description: 'Cultural services - performing arts', rate: 18, type: 'services' },
  '998512': { description: 'Cultural services - arts facility operation', rate: 18, type: 'services' },
  '998513': { description: 'Cultural services - library and archive', rate: 18, type: 'services' },
  '998514': { description: 'Cultural services - other', rate: 18, type: 'services' },
  '998611': { description: 'Religious services', rate: 18, type: 'services' },
  '998711': { description: 'Personal services - domestic', rate: 18, type: 'services' },
  '998712': { description: 'Personal services - beauty and wellness', rate: 18, type: 'services' },
  '998713': { description: 'Personal services - funeral', rate: 18, type: 'services' },
  '998714': { description: 'Personal services - other', rate: 18, type: 'services' },
  '998811': { description: 'Maintenance and repair services of metal products', rate: 18, type: 'services' },
  '998812': { description: 'Maintenance and repair services of machinery', rate: 18, type: 'services' },
  '998813': { description: 'Maintenance and repair services of office', rate: 18, type: 'services' },
  '998814': { description: 'Maintenance and repair services of aircraft', rate: 18, type: 'services' },
  '998815': { description: 'Maintenance and repair services of ships', rate: 18, type: 'services' },
  '998816': { description: 'Maintenance and repair services of railway', rate: 18, type: 'services' },
  '998817': { description: 'Maintenance and repair services of motor', rate: 18, type: 'services' },
  '998818': { description: 'Maintenance and repair services of other', rate: 18, type: 'services' },
  '998819': { description: 'Maintenance and repair services of other', rate: 18, type: 'services' },
  '998911': { description: 'Other business services - packaging', rate: 18, type: 'services' },
  '998912': { description: 'Other business services - convention', rate: 18, type: 'services' },
  '998913': { description: 'Other business services - trade fair', rate: 18, type: 'services' },
  '998914': { description: 'Other business services - interior decoration', rate: 18, type: 'services' },
  '998915': { description: 'Other business services - manpower recruitment', rate: 18, type: 'services' },
  '998916': { description: 'Other business services - security', rate: 18, type: 'services' },
  '998917': { description: 'Other business services - industrial cleaning', rate: 18, type: 'services' },
  '998918': { description: 'Other business services - building cleaning', rate: 18, type: 'services' },
  '998919': { description: 'Other business services - other', rate: 18, type: 'services' },
  '999111': { description: 'Public administration services', rate: 18, type: 'services' },
  '999211': { description: 'Defense services', rate: 18, type: 'services' },
  '999311': { description: 'Justice and public safety services', rate: 18, type: 'services' },
  '999411': { description: 'Compulsory social security services', rate: 18, type: 'services' },
  '999511': { description: 'International organization services', rate: 18, type: 'services' },
  '999611': { description: 'Extra-territorial organization services', rate: 18, type: 'services' },
};

// Reverse Charge Mechanism (RCM) applicable services
const RCM_SERVICES: string[] = [
  'GTA', // Goods Transport Agency
  'legal', // Legal services by advocate
  'arbitral', // Arbitral tribunal services
  'sponsorship', // Sponsorship services
  'transport', // Transport services (non-GTA)
  'insurance_agent', // Insurance agent services
  'recovery_agent', // Recovery agent services
  'director', // Director services to company
  'insurance', // Insurance services
  'money_changer', // Money changing services
  'auctioneer', // Auctioneer services
  'mining', // Mining services
  'government', // Government services to business
  'OLDS', // Online gaming, lottery, betting
];

/**
 * Get GST rate for an HSN code
 */
export function getGstRate(
  hsnCode: string,
  placeOfSupply: string,
  goods: boolean
): { rate: number; type: 'goods' | 'services'; cess?: number; exempt?: boolean } {
  // Normalize HSN code (remove spaces, convert to uppercase)
  const normalizedHsn = hsnCode.replace(/\s/g, '').toUpperCase();
  
  // Lookup HSN code
  const hsnData = HSN_MAPPINGS[normalizedHsn];
  
  if (hsnData) {
    // Validate goods/services type matches
    if (hsnData.type !== (goods ? 'goods' : 'services')) {
      // Type mismatch - return default rate
      return { rate: 18, type: goods ? 'goods' : 'services' };
    }
    
    return {
      rate: hsnData.rate,
      type: hsnData.type,
      cess: hsnData.cess,
      exempt: hsnData.exempt,
    };
  }
  
  // Default rate: 18%
  return { rate: 18, type: goods ? 'goods' : 'services' };
}

/**
 * Get place of supply (state code) from state name
 */
export function getPlaceOfSupply(state: string): string {
  const normalizedState = state.trim();
  const stateCode = STATE_CODES[normalizedState];
  
  if (!stateCode) {
    throw new Error(`Invalid state: ${state}. Valid states: ${Object.keys(STATE_CODES).join(', ')}`);
  }
  
  return stateCode;
}

/**
 * Check if Reverse Charge Mechanism (RCM) applies
 */
export function isReverseChargeApplicable(goods: boolean, serviceType: string): boolean {
  // RCM only applies to services
  if (goods) {
    return false;
  }
  
  const normalizedType = serviceType.toLowerCase().trim();
  
  // Check if service type matches any RCM category
  return RCM_SERVICES.some(rcmType => 
    normalizedType.includes(rcmType.toLowerCase())
  );
}

/**
 * Get HSN description
 */
export function getHsnDescription(hsnCode: string): string {
  const normalizedHsn = hsnCode.replace(/\s/g, '').toUpperCase();
  const hsnData = HSN_MAPPINGS[normalizedHsn];
  
  if (!hsnData) {
    return 'HSN code not found';
  }
  
  return hsnData.description;
}

/**
 * Get all available state codes
 */
export function getAllStateCodes(): Record<string, string> {
  return { ...STATE_CODES };
}

/**
 * Get all HSN codes in a specific rate slab
 */
export function getHsnCodesByRate(rate: number): string[] {
  return Object.entries(HSN_MAPPINGS)
    .filter(([_, data]) => data.rate === rate)
    .map(([hsn, _]) => hsn)
    .sort();
}

/**
 * Search HSN codes by description
 */
export function searchHsnCodes(query: string): Array<{ hsn: string; description: string; rate: number }> {
  const normalizedQuery = query.toLowerCase().trim();
  
  return Object.entries(HSN_MAPPINGS)
    .filter(([_, data]) => 
      data.description.toLowerCase().includes(normalizedQuery)
    )
    .map(([hsn, data]) => ({
      hsn,
      description: data.description,
      rate: data.rate,
    }))
    .sort((a, b) => a.rate - b.rate || a.hsn.localeCompare(b.hsn));
}
