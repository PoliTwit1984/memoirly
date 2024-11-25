# Memoirly Error Fixes Needed

## 1. Invitation System Route Error
- **Error**: `Could not build url for endpoint 'main.join_tribe' with values ['token']`
- **Location**: `utils.py` in `send_invitation_email` function
- **Fix Required**: Add missing route for handling invitation tokens in `main.py`
- **Impact**: Email invitations are not working

## 2. DateTime Deprecation Warnings
- **Error**: `datetime.datetime.utcnow() is deprecated and scheduled for removal`
- **Location**: Multiple files:
  - `main.py` (tribe creation, invitation)
  - `models.py` (document updates)
  - `utils.py` (invitation handling)
- **Fix Required**: Replace all `datetime.utcnow()` with `datetime.now(UTC)`
- **Impact**: Future compatibility issues

## 3. Member Display Issues
- **Error**: User data not properly linked in tribe views
- **Location**: 
  - `main.py` in `view_tribe` route
  - `templates/tribes/view.html`
- **Fix Required**: Update member queries to include user data
- **Impact**: Member information not displaying correctly

## 4. Cosmos DB Query Optimization
- **Issue**: Multiple separate queries for related data
- **Location**: `main.py` in tribe-related routes
- **Fix Required**: Implement compound queries where possible
- **Impact**: Performance overhead

## Priority Order
1. Invitation System (Critical - Blocking Feature)
2. DateTime Updates (Important - Future Compatibility)
3. Member Display (Important - User Experience)
4. Query Optimization (Nice to Have - Performance)

## Next Steps
1. Add `/tribes/join/<token>` route
2. Update all datetime handling to use UTC
3. Implement proper user data linking
4. Optimize database queries

## Testing Requirements
- Verify invitation flow end-to-end
- Test datetime operations across all features
- Check member display in all tribe views
- Measure query performance improvements
