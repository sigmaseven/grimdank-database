# Database Refactoring Migration Guide

## Overview
This guide outlines the migration from embedded rule data to a reference-based architecture using MongoDB ObjectIDs.

## Benefits of Refactored Architecture

### ✅ **Advantages:**
1. **No Data Duplication**: Rules stored once, referenced everywhere
2. **Consistent Updates**: Change a rule once, affects all references
3. **Smaller Documents**: Reduced storage footprint
4. **Better Performance**: Faster queries on smaller documents
5. **Normalized Data**: Follows database best practices
6. **Tier Selection**: Support for rule tiers (1, 2, 3) per reference

### ⚠️ **Trade-offs:**
1. **Additional Queries**: Need to populate references
2. **Complexity**: More complex service layer
3. **Consistency**: Need to handle orphaned references

## Migration Steps

### Phase 1: Create New Entity Structures
1. **Add new models** with reference-based fields
2. **Keep existing models** for backward compatibility
3. **Create population services** for handling references

### Phase 2: Dual Write Strategy
1. **Write to both** old and new structures
2. **Populate references** from embedded data
3. **Validate consistency** between old and new data

### Phase 3: Update API Layer
1. **Create new handlers** for reference-based operations
2. **Add population endpoints** for full data retrieval
3. **Maintain backward compatibility** with old endpoints

### Phase 4: Frontend Updates
1. **Update API calls** to use new endpoints
2. **Handle reference-based data** in components
3. **Implement population logic** for rule display

### Phase 5: Data Migration
1. **Migrate existing data** from embedded to references
2. **Validate data integrity** after migration
3. **Remove old embedded fields** once migration is complete

## API Changes

### Before (Embedded Rules):
```json
{
  "id": "weapon123",
  "name": "Bolter",
  "points": 10,
  "rules": [
    {
      "id": "rule456",
      "name": "Rapid Fire",
      "points": [2, 3, 4]
    }
  ]
}
```

### After (Reference-Based):
```json
{
  "id": "weapon123",
  "name": "Bolter",
  "points": 10,
  "rules": [
    {
      "ruleId": "rule456",
      "tier": 1
    }
  ]
}
```

### Populated Response:
```json
{
  "weapon": {
    "id": "weapon123",
    "name": "Bolter",
    "points": 10,
    "rules": [
      {
        "ruleId": "rule456",
        "tier": 1
      }
    ],
    "populatedRules": [
      {
        "id": "rule456",
        "name": "Rapid Fire",
        "points": [2, 3, 4]
      }
    ]
  },
  "totalPoints": 12,
  "basePoints": 10,
  "rulePoints": 2
}
```

## New API Endpoints

### Weapons with Rules:
- `GET /api/v1/weapons/{id}/with-rules` - Get weapon with populated rules
- `POST /api/v1/weapons/{id}/rules` - Add rule to weapon
- `DELETE /api/v1/weapons/{id}/rules/{ruleId}` - Remove rule from weapon

### Population Control:
- `GET /api/v1/weapons?populate=true` - Get all weapons with rules
- `GET /api/v1/weapons?populate=false` - Get weapons without rules (faster)

## Frontend Changes

### Rule Selection:
```javascript
// Before: Direct rule objects
const selectedRules = [
  { id: "rule1", name: "Rapid Fire", points: [2, 3, 4] }
];

// After: Rule references with tier selection
const selectedRules = [
  { ruleId: "rule1", tier: 1 }
];
```

### API Calls:
```javascript
// Before: Rules embedded in weapon
const weapon = await weaponsAPI.getById(id);

// After: Need to populate rules
const weapon = await weaponsAPI.getWithRules(id);
// or
const weapons = await weaponsAPI.getAll({ populate: true });
```

## Database Queries

### Before (Embedded):
```javascript
// Find weapons with specific rule
db.weapons.find({ "rules.name": "Rapid Fire" })
```

### After (References):
```javascript
// Find weapons with specific rule
db.weapons.find({ "rules.ruleId": ObjectId("rule456") })
```

## Performance Considerations

### Caching Strategy:
1. **Cache populated rules** to avoid repeated queries
2. **Use aggregation pipelines** for complex population
3. **Implement lazy loading** for large datasets

### Query Optimization:
1. **Index rule references** for faster lookups
2. **Use projection** to limit returned fields
3. **Batch populate** multiple references at once

## Rollback Plan

### If Issues Arise:
1. **Keep old endpoints** active during transition
2. **Maintain dual writes** until migration is complete
3. **Have rollback scripts** ready for data restoration
4. **Monitor performance** during migration

## Testing Strategy

### Unit Tests:
- Test population services
- Test reference management
- Test tier selection logic

### Integration Tests:
- Test API endpoints with populated data
- Test data consistency
- Test performance with large datasets

### Migration Tests:
- Test data migration scripts
- Validate data integrity
- Test rollback procedures

## Conclusion

The refactored architecture provides significant benefits in terms of data consistency, storage efficiency, and maintainability. The migration should be done incrementally with careful testing and monitoring.
