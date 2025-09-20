# Task Template

## Constitution Compliance Check
- [ ] **Free and Open Source:** Task uses only open source tools/libraries
- [ ] **Code Quality Excellence:** Task follows established coding standards
- [ ] **Comprehensive Testing:** Task includes appropriate test coverage
- [ ] **User Experience Consistency:** Task maintains UX standards
- [ ] **Performance Requirements:** Task meets performance benchmarks
- [ ] **Chinese Language Support:** Task includes Chinese localization requirements

## Task Information
**Task ID:** [TASK_ID]
**Title:** [TASK_TITLE]
**Priority:** [HIGH/MEDIUM/LOW]
**Estimated Effort:** [ESTIMATE]
**Assigned To:** [ASSIGNEE]

## Description
[TASK_DESCRIPTION]

## Acceptance Criteria
- [ ] [CRITERION_1]
- [ ] [CRITERION_2]
- [ ] [CRITERION_3]
- [ ] [CRITERION_4]

## Technical Requirements

### Code Quality Standards
- [ ] Follows established linting rules
- [ ] Includes comprehensive error handling
- [ ] Has clear, self-documenting code
- [ ] Follows SOLID principles
- [ ] Includes inline documentation for complex logic

### Testing Requirements
- [ ] Unit tests achieve minimum coverage threshold
- [ ] Integration tests cover external dependencies
- [ ] E2E tests validate user workflows (if applicable)
- [ ] Performance tests validate benchmarks (if applicable)
- [ ] All tests are fast and reliable

### User Experience Requirements
- [ ] Follows established design system
- [ ] Maintains accessibility standards (WCAG 2.1 AA)
- [ ] Provides appropriate loading states
- [ ] Includes clear error messages
- [ ] Works across all supported devices
- [ ] Supports Simplified Chinese (zh-CN) interface
- [ ] Includes Chinese error message localization
- [ ] Supports Chinese input methods
- [ ] Follows Chinese locale formatting standards

### Performance Requirements
- [ ] Meets established performance benchmarks
- [ ] Optimizes database queries
- [ ] Implements appropriate caching
- [ ] Monitors resource usage
- [ ] Scales horizontally (if applicable)

## Implementation Details

### Files to Modify
- [FILE_1]: [MODIFICATION_TYPE]
- [FILE_2]: [MODIFICATION_TYPE]
- [FILE_3]: [MODIFICATION_TYPE]

### Dependencies
- [DEPENDENCY_1]: [VERSION_REQUIREMENT]
- [DEPENDENCY_2]: [VERSION_REQUIREMENT]

### API Changes
```typescript
// New interfaces/types
interface [NEW_INTERFACE] {
  [PROPERTY]: [TYPE];
}

// Modified interfaces/types
interface [MODIFIED_INTERFACE] {
  [NEW_PROPERTY]: [TYPE];
  [EXISTING_PROPERTY]: [TYPE]; // modified
}
```

### Database Changes
```sql
-- New tables
CREATE TABLE [NEW_TABLE] (
  [COLUMN] [TYPE] [CONSTRAINTS]
);

-- Modified tables
ALTER TABLE [EXISTING_TABLE] 
ADD COLUMN [NEW_COLUMN] [TYPE];
```

## Testing Strategy

### Unit Tests
```typescript
describe('[COMPONENT_NAME]', () => {
  it('[TEST_CASE_1]', () => {
    // Test implementation
  });
  
  it('[TEST_CASE_2]', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('[INTEGRATION_TEST_NAME]', () => {
  it('[INTEGRATION_SCENARIO]', async () => {
    // Integration test implementation
  });
});
```

### E2E Tests
```typescript
describe('[E2E_TEST_NAME]', () => {
  it('[USER_WORKFLOW]', async () => {
    // E2E test implementation
  });
});
```

## Performance Considerations
- [PERFORMANCE_OPTIMIZATION_1]
- [PERFORMANCE_OPTIMIZATION_2]
- [PERFORMANCE_OPTIMIZATION_3]

## Security Considerations
- [SECURITY_REQUIREMENT_1]
- [SECURITY_REQUIREMENT_2]
- [SECURITY_REQUIREMENT_3]

## Definition of Done
- [ ] Code implemented according to specifications
- [ ] All tests written and passing
- [ ] Code review completed and approved
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Accessibility requirements verified
- [ ] Security review completed
- [ ] Integration tests passing
- [ ] E2E tests passing (if applicable)

## Notes
[ADDITIONAL_NOTES_OR_CONTEXT]