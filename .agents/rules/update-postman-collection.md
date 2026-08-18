---
trigger: always_on
description: Mandatory synchronization of Fuel_Monitoring_API.postman_collection.json whenever API controllers, routes, or DTOs are created or modified
---

# Rule: Postman Collection Synchronization

Whenever you **create**, **modify**, **refactor**, or **delete** any backend API controller (`*.controller.ts`), route handler, or associated request/response DTO in this project, you **MUST ALWAYS** update the Postman collection file:

📁 **Target File**: `Fuel_Monitoring_API.postman_collection.json` (located at the backend root)

---

## 1. Mandatory Checklist for Controller Changes

Every time an API controller is added or updated:

1. **Identify the Scope**:
   - Check which module/controller changed (e.g., `src/modules/*/*.controller.ts`).
   - Identify all added, updated, or removed endpoint methods (`@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`).
   - Inspect request DTOs, query parameters (`@Query()`), route parameters (`@Param()`), and body schemas (`@Body()`).
   - Check authentication/authorization decorators (`@Public()`, `@UseGuards(JwtAuthGuard)`, `@RequirePermissions(...)`, `@Roles(...)`).

2. **Locate or Create the Target Folder in Postman**:
   - Find the corresponding folder inside `item[]` (e.g., `01. Authentication`, `03. Transactions`, `12. System Management`, `14. Forecourt Management System (FMS)`).
   - If a new module is introduced, create a new folder following the existing numbering convention: `XX. Module Name`.

3. **Update or Add Requests**:
   - **Request Name**: Clear and human-readable (e.g., `Module: Action Name` or `Action Name`).
   - **Method**: Exact HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
   - **URL & Path**:
     - Use `{{baseUrl}}` for the host (e.g. `{{baseUrl}}/api/system/audit`).
     - Split path elements cleanly into the `path: [...]` array.
     - Include route parameters as Postman path variables (`:id`, `:code`, etc.) with meaningful descriptions.
     - Include supported query parameters in `query: [...]` with `key`, `value`, `description`, and `disabled: true` if optional.
   - **Authentication**:
     - Public endpoints (`@Public()`): Set `"auth": { "type": "noauth" }`.
     - JWT Protected endpoints (`@UseGuards(JwtAuthGuard)`): Ensure Bearer token `{{token}}` is applied or inherited.
     - Hardware / Controller endpoints (e.g. controller push): Include required custom headers such as `x-controller-secret: {{controller_secret}}`.
   - **Headers**: Include `Content-Type: application/json` for requests with JSON body.
   - **Request Body (`raw` JSON)**:
     - Provide a complete, valid JSON payload reflecting all DTO fields with realistic example values.
     - Set `"mode": "raw"` and `"options": { "raw": { "language": "json" } }`.
   - **Description**: Provide a concise summary of what the endpoint does, required permissions/roles, and query/body details.

4. **Handle Authentication & Token Capture**:
   - For login or token-generating endpoints, include a Postman test script (`listen: "test"`) that automatically saves the returned JWT token to `pm.collectionVariables.set('token', json.data.token)`.

5. **Validate JSON Integrity**:
   - Ensure `Fuel_Monitoring_API.postman_collection.json` remains valid, well-formed JSON with proper syntax and consistent 2-space indentation.
