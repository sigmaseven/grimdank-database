# WarGear Type Field Removal & Automatic Point Calculation

## Summary
1. **Removed Type field from WarGear** - WarGear items no longer have a type field as it's not needed
2. **Added automatic point calculation** - WarGear points now automatically update when rules are attached/removed

## Changes Made

### 1. Backend - Model Definition

#### File: `models/entities.go`
**Removed Type field from WarGear struct:**

```go
// Before
type WarGear struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name        string             `bson:"name" json:"name" validate:"required"`
    Type        string             `bson:"type" json:"type"`  // REMOVED
    Description string             `bson:"description" json:"description"`
    Points      int                `bson:"points" json:"points"`
    Rules       []RuleReference    `bson:"rules" json:"rules"`
}

// After
type WarGear struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name        string             `bson:"name" json:"name" validate:"required"`
    Description string             `bson:"description" json:"description"`
    Points      int                `bson:"points" json:"points"`
    Rules       []RuleReference    `bson:"rules" json:"rules"`
}
```

### 2. Frontend - WarGear Component

#### File: `frontend/src/components/WarGear.js`

**Changes:**

1. **Removed Type from formData state**
   - Line 33-38: Removed `type: ''` from initial state
   - Line 228-234: Removed `type: ''` from resetForm
   - Line 275-279: Removed `type` from handleEdit

2. **Removed Type input field from form**
   - Removed entire form group for Type input (lines ~374-384)

3. **Removed Type column from table**
   - Table header: Removed `<th>Type</th>`
   - Table body: Removed `<td>{wargearItem.type}</td>`

4. **Added automatic point calculation** (like Weapons component)
   ```javascript
   // Line 48: Added ref to track base points
   const baseWarGearPointsRef = useRef(0);
   
   // Lines 229-233: Update base points when no rules attached
   useEffect(() => {
     if (selectedRules.length === 0) {
       baseWarGearPointsRef.current = formData.points || 0;
     }
   }, [formData.points, selectedRules.length]);
   
   // Lines 235-252: Auto-calculate total points from rules
   useEffect(() => {
     const rulePoints = selectedRules.reduce((total, rule) => {
       const points = rule.points || [];
       if (rule.tier && rule.tier >= 1 && rule.tier <= points.length) {
         return total + (points[rule.tier - 1] || 0);
       } else {
         return total + (points[0] || 0);
       }
     }, 0);
     const totalPoints = baseWarGearPointsRef.current + rulePoints;
     setFormData(prev => ({
       ...prev,
       points: totalPoints
     }));
   }, [selectedRules]);
   ```

5. **Made Points field read-only when rules attached**
   ```javascript
   // Lines 405-411: Visual feedback for auto-calculation
   style={{
     backgroundColor: selectedRules.length > 0 ? '#21262d' : undefined,
     color: selectedRules.length > 0 ? '#8b949e' : undefined,
     cursor: selectedRules.length > 0 ? 'not-allowed' : undefined
   }}
   readOnly={selectedRules.length > 0}
   
   // Lines 413-421: Helper text
   {selectedRules.length > 0 && (
     <div>Auto-calculated: Base wargear + rule points</div>
   )}
   ```

### 3. Frontend - Units Component

#### File: `frontend/src/components/Units.js`

**Removed Type display in wargear tags:**

1. **Line 1249-1259**: Removed type badge from wargear tag display
2. **Line 2053**: Removed type from dropdown option text
3. **Line 2078-2079**: Simplified description display (no type prefix)
4. **Line 2038**: Removed type from onChange handler

**Before:**
```javascript
{wargear.type && (
  <span>{wargear.type}</span>
)}
```

**After:**
```javascript
// Removed entirely
```

### 4. Backend - Handlers

#### File: `handlers/import_handler.go`
**Removed Type from example template:**

```go
// Before (Line 253)
Type: "Equipment",

// After
// Removed
```

### 5. Tests

#### Files Updated:
- `models/entities_test.go` - Removed Type assertion, added Description test
- `tests/wargear_crud_test.go` - Removed Type from all test wargear creations (3 instances)
- `tests/integration_test.go` - Removed Type from test data (3 instances)
- `tests/entity_relationships_test.go` - Removed Type from test wargear (2 instances)
- `tests/population_service_test.go` - Removed Type from test wargear (2 instances)
- `tests/setup_test.go` - Removed Type from CreateTestWarGear and AssertEqualWarGear

**Total Test Instances Updated:** 15+

## Automatic Point Calculation Behavior

### How It Works

1. **User enters base points** (e.g., 10)
   - `baseWarGearPointsRef.current = 10`

2. **User attaches a rule** (e.g., Tier 2 with 15 pts)
   - Rule points calculated: 15
   - Total points: 10 + 15 = 25
   - Points field updates automatically to 25

3. **User attaches another rule** (e.g., Tier 1 with 5 pts)
   - Rule points calculated: 15 + 5 = 20
   - Total points: 10 + 20 = 30
   - Points field updates to 30

4. **User removes a rule**
   - Rule points recalculated without removed rule
   - Total points adjusted automatically

5. **Points field is read-only when rules attached**
   - Grayed out appearance
   - Cannot be manually edited
   - Shows helper text: "Auto-calculated: Base wargear + rule points"

### Same Pattern as Weapons

WarGear now uses the exact same automatic calculation pattern as Weapons:
- ✅ Base points tracked with useRef
- ✅ Rule points calculated using tier-specific values
- ✅ Total updates automatically when rules change
- ✅ Field becomes read-only when rules attached
- ✅ Visual feedback shows auto-calculation is active

## Rationale for Removing Type Field

### Why WarGear Doesn't Need Type

**Weapons** have types (melee/ranged) because:
- They attach to units in specific slots
- Units can have "up to 3 melee" and "up to 3 ranged" weapons
- Type determines where weapon can be attached

**WarGear** doesn't need types because:
- WarGear attaches to units with no type restrictions
- No separate "slots" or categories for wargear
- Type field was never used for filtering or validation
- Description field provides sufficient detail

### Database Impact

**No migration needed** - existing wargear items can keep their type field in the database. The application simply ignores it now. New items won't have the field.

## Testing Verification

### All Tests Pass ✅
```
ok  	grimdank-database/config       0.288s
ok  	grimdank-database/database     0.500s
ok  	grimdank-database/handlers     0.394s
ok  	grimdank-database/models       0.194s
ok  	grimdank-database/repositories 0.388s
ok  	grimdank-database/services     0.359s
ok  	grimdank-database/tests        3.337s
```

### Test Coverage
- ✅ WarGear CRUD operations
- ✅ WarGear bulk import
- ✅ WarGear pagination
- ✅ Entity relationships with WarGear
- ✅ Population service with WarGear rules
- ✅ Integration tests with WarGear

## Frontend Testing Checklist

### WarGear Management
- [ ] Create new wargear without Type field
- [ ] Verify it saves successfully
- [ ] Verify table displays correctly (no Type column)

### Automatic Point Calculation
- [ ] Create new wargear, set points to 10
- [ ] Attach a rule with Tier 1 (5 pts)
- [ ] Verify points auto-update to 15
- [ ] Attach another rule with Tier 2 (10 pts)
- [ ] Verify points auto-update to 25
- [ ] Remove first rule
- [ ] Verify points auto-update to 20
- [ ] Remove all rules
- [ ] Verify points field becomes editable again

### WarGear Selector in Units
- [ ] Open unit dialog
- [ ] Click "Attach WarGear"
- [ ] Verify dropdown shows wargear without type info
- [ ] Select wargear
- [ ] Verify it attaches successfully
- [ ] Verify no type badge appears in attached wargear list

## Benefits

1. **Simplified Data Model** - One less field to maintain
2. **Cleaner UI** - No unnecessary type information cluttering the display
3. **Automatic Calculation** - Points update automatically like weapons
4. **Consistency** - Both Weapons and WarGear now auto-calculate points
5. **Better UX** - Users don't have to manually calculate rule point costs

## Related Components

### Components Affected
- ✅ `models/entities.go` - Model definition
- ✅ `frontend/src/components/WarGear.js` - WarGear management
- ✅ `frontend/src/components/Units.js` - WarGear display in units
- ✅ `handlers/import_handler.go` - Import template
- ✅ All test files with WarGear instances

### Components NOT Affected
- Weapons (still has Type field - needed for melee/ranged)
- Units (still has Type field - needed for Infantry/Vehicle/etc.)
- Rules (still has Type field - needed for Unit/Weapon/WarGear)
- Factions (still has Type field - needed for Official/Custom)

## Database Notes

### Legacy Data
Existing wargear items in the database may still have a `type` field. This is fine:
- Backend will ignore it when reading
- Frontend won't display it
- New items won't have it
- No migration script needed

### If Migration Desired
```javascript
// Optional: Remove type field from all wargear documents
db.wargear.updateMany({}, { $unset: { type: "" } })
```

## Related Documentation

- `SELECTOR_DIALOG_STANDARDIZATION.md` - Selector dialog patterns (updated)
- `WEAPON_TYPE_STANDARDIZATION.md` - Weapon type standardization (WarGear now different)

