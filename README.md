# E-Types

A comprehensive TypeScript type definitions library for both backend and frontend applications, designed to provide consistent type safety across your entire stack. **Includes both TypeScript types and runtime values** (enums, constants, validation schemas).

## 📦 Installation

```bash
npm install @e-types/core
# or
yarn add @e-types/core
# or
pnpm add @e-types/core
```

## 🚀 Usage

### Import all types and runtime values
```typescript
import * from '@e-types/core';
```

### Import specific type modules
```typescript
import { User, LoginRequest, AuthError, UserStatus, AUTH_CONSTANTS } from '@e-types/core';
import { ApiResponse, PaginatedResponse, HttpStatusCode, API_CONSTANTS } from '@e-types/core';
import { FileUploadRequest, ImageFile } from '@e-types/core';
```

### Import from specific modules
```typescript
// Authentication types and enums
import type { User, AuthState, LoginRequest } from '@e-types/core/auth';
import { UserStatus, AuthProvider, AUTH_CONSTANTS } from '@e-types/core/auth';

// API types and constants
import type { ApiResponse, PaginationParams } from '@e-types/core/api';
import { HttpStatusCode, ApiStatus, API_CONSTANTS } from '@e-types/core/api';

// UI component types and constants
import type { ButtonProps, ModalProps } from '@e-types/core/ui';
import { ComponentSizeEnum, ThemeMode, UI_CONSTANTS } from '@e-types/core/ui';

// Validation schemas
import { ValidationSchemas, FormSchemas, CommonValidationRules } from '@e-types/core/schemas';
```

## 📚 Available Type Modules

### 🔐 Authentication (`auth.ts`)
- User management and profiles
- Login/registration flows
- JWT tokens and sessions
- OAuth integration
- Permission and role-based access

### 🌐 API (`api.ts`)
- HTTP request/response types
- Pagination and filtering
- Error handling
- File uploads
- Webhooks

### 🛠 Common (`common.ts`)
- Utility types
- TypeScript helper types
- Generic type transformations

### 🗄 Database (`database.ts`)
- Entity base types
- Query options
- Migration types
- Transaction handling
- Schema definitions

### ❌ Errors (`errors.ts`)
- Comprehensive error types
- Error handling patterns
- Client-side error tracking
- Error recovery strategies

### 📁 Files (`files.ts`)
- File upload/download
- Media metadata
- Image, video, audio types
- File permissions and sharing
- Cloud storage integration

### 🔔 Notifications (`notifications.ts`)
- Push notifications
- FCM event types (`fcmEvents.ts`) — `FCMEventType`, including the `REDEMPTION_*` mutual-fund redemption pushes and their `RedemptionFcmData` payload
- Email templates
- SMS messaging
- In-app notifications
- Notification campaigns

### 🎨 UI (`ui.ts`)
- React/React Native components
- Theme and styling
- Form validation
- Navigation types
- Accessibility

### ⚙️ Config (`config.ts`)
- Application configuration
- Environment variables
- Feature flags
- Integration settings

## 🎯 Key Features

### Type Safety
- Comprehensive type coverage for common application patterns
- Strict TypeScript configurations
- No `any` types used

### Framework Agnostic
- Works with React, React Native, Vue, Angular
- Backend framework independent
- Database ORM agnostic

### Modern Standards
- Latest TypeScript features
- ESM and CommonJS support
- Tree-shaking friendly

### Developer Experience
- Detailed JSDoc comments
- IDE autocomplete support
- Consistent naming conventions

## 📖 Examples

### User Authentication Flow with Enums
```typescript
import { User, LoginRequest, LoginResponse, AuthState, UserStatus, AUTH_CONSTANTS } from '@e-types/core';

// Using enums for type safety
const user: User = {
  id: '123',
  status: UserStatus.ACTIVE, // Runtime enum value
  // ... other properties
};

// Using constants
const isValidPassword = password.length >= AUTH_CONSTANTS.PASSWORD_MIN_LENGTH;

// Login function with timeout
async function login(request: LoginRequest): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_CONSTANTS.SESSION_TIMEOUT);
  
  try {
    // Implementation with abort signal
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(request),
      signal: controller.signal
    });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### API Response Handling with Status Codes
```typescript
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  HttpStatusCode, 
  HttpStatusRanges 
} from '@e-types/core';

// Using enum for status codes
const handleApiResponse = (response: Response) => {
  switch (response.status) {
    case HttpStatusCode.OK:
      return 'Success';
    case HttpStatusCode.UNAUTHORIZED:
      return 'Please login';
    case HttpStatusCode.NOT_FOUND:
      return 'Resource not found';
    default:
      if (HttpStatusRanges.isServerError(response.status)) {
        return 'Server error, please try again';
      }
      return 'Unknown error';
  }
};
```

### Form Validation with Schemas
```typescript
import { 
  FormSchemas, 
  ValidationSchemas, 
  CommonValidationRules,
  ValidationErrorCode 
} from '@e-types/core';

// Using pre-built validation schema
const validateLoginForm = (data: { email: string; password: string }) => {
  const schema = FormSchemas.login;
  const errors: string[] = [];
  
  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!ValidationSchemas.email.pattern.test(data.email)) {
    errors.push(ValidationSchemas.email.message);
  }
  
  // Password validation
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Custom validation rule
const customRule = {
  type: ValidationErrorCode.CUSTOM_ERROR,
  message: 'This field has a custom validation error'
};
```

### UI Components with Theme Constants
```typescript
import { 
  ButtonProps, 
  ComponentSizeEnum, 
  ThemeMode, 
  UI_CONSTANTS 
} from '@e-types/core';

const Button: React.FC<ButtonProps> = ({ 
  size = ComponentSizeEnum.MD, 
  variant = 'primary',
  children, 
  ...props 
}) => {
  const getButtonSize = () => {
    switch (size) {
      case ComponentSizeEnum.SM:
        return { padding: '8px 16px', fontSize: '14px' };
      case ComponentSizeEnum.LG:
        return { padding: '12px 24px', fontSize: '18px' };
      default:
        return { padding: '10px 20px', fontSize: '16px' };
    }
  };

  return (
    <button
      style={{
        ...getButtonSize(),
        transition: `all ${UI_CONSTANTS.ANIMATION_DURATION.NORMAL}ms ease`,
        zIndex: props.onClick ? UI_CONSTANTS.Z_INDEX.DROPDOWN : 'auto'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Theme switching
const [theme, setTheme] = useState(ThemeMode.SYSTEM);

const toggleTheme = () => {
  setTheme(current => 
    current === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT
  );
};
```

### API Response Handling
```typescript
import { ApiResponse, PaginatedResponse, User } from '@e-types/core';

// Single item response
const userResponse: ApiResponse<User> = await fetchUser(id);

// Paginated response
const usersResponse: PaginatedResponse<User> = await fetchUsers({
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc'
});
```

### File Upload
```typescript
import { FileUploadRequest, FileUploadResponse } from '@e-types/core';

const uploadRequest: FileUploadRequest = {
  file: selectedFile,
  folder: 'avatars',
  isPublic: true,
  generateThumbnails: true
};

const response: FileUploadResponse = await uploadFile(uploadRequest);
```

### UI Components
```typescript
import { ButtonProps, ModalProps } from '@e-types/core';

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  // Component implementation
};

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  size = 'md', 
  children 
}) => {
  // Modal implementation
};
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Packages

- [`@types/node`](https://www.npmjs.com/package/@types/node) - Node.js type definitions
- [`@types/react`](https://www.npmjs.com/package/@types/react) - React type definitions
- [`@types/react-native`](https://www.npmjs.com/package/@types/react-native) - React Native type definitions

## 📊 Package Stats

- **Zero dependencies** - Lightweight and fast
- **Tree-shakeable** - Import only what you need
- **TypeScript first** - Built with TypeScript, for TypeScript
- **Framework agnostic** - Use with any frontend/backend framework
