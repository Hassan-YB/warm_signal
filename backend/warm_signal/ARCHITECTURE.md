# Django Architecture Guidelines

## Core Principles

This project follows Django best practices with a focus on separation of concerns and maintainability.

### Architecture Pattern

```
┌─────────────┐
│   Views     │  ← CLASS-BASED views, minimal code, delegates to serializers/models
│ (APIView)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Serializers  │  ← Data validation and transformation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Models    │  ← Business logic, data operations
└─────────────┘
```

### Key Rules

1. **CLASS-BASED VIEWS ONLY**
   - All views must be class-based (inherit from APIView or ViewSet)
   - NO function-based views (@api_view decorator)
   - Use method names: `get()`, `post()`, `put()`, `patch()`, `delete()`

2. **Business Logic in Models**
   - All business logic should be implemented in model methods
   - Models handle data validation, creation, and manipulation
   - Example: `User.create_user_with_email()` handles all user creation logic

3. **Serializers for Validation**
   - Serializers handle input/output validation
   - Transform data between API and model formats
   - Do NOT contain business logic - delegate to models

4. **Views are Thin**
   - Views contain minimal code
   - Primary responsibilities:
     - Receive requests
     - Call serializers for validation
     - Call model methods for business operations
     - Return standardized responses
   - Views should be easy to read and understand

5. **Standardized API Responses**
   - All APIs must use the same response structure
   - Success responses: `{"success": true, "message": "...", "data": {...}}`
   - Error responses: `{"success": false, "message": "...", "errors": {...}}`
   - Use `utils.success_response()` and `utils.error_response()` helpers

### Example Structure

#### Model (Business Logic)
```python
class User(AbstractUser):
    @classmethod
    def create_user_with_email(cls, email, password, **extra_fields):
        """Business logic: Create user with validation"""
        # All creation logic here
        ...
```

#### Serializer (Validation)
```python
class UserSignupSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        # Delegate to model method
        return User.create_user_with_email(...)
```

#### View (Class-Based, Minimal Code)
```python
class SignupView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Calls model method
            return success_response(data={...}, message="Success")
        return error_response(message="Error", errors=serializer.errors)
```

## Benefits

- **Testability**: Business logic in models is easy to test
- **Reusability**: Model methods can be used from anywhere
- **Maintainability**: Clear separation makes code easier to understand
- **Consistency**: Standard pattern and response structure across the codebase
- **Scalability**: Class-based views are easier to extend and customize

## When Adding New Features

1. Define business logic in model methods
2. Create serializers for validation
3. Create class-based views that delegate to serializers/models
4. Use standardized response helpers (success_response/error_response)
5. Add comments explaining the architecture pattern

