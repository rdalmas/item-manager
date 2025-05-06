# Item Manager Application

## Overview

Item Manager is an Angular application for managing shared items between multiple parties. Users can create items, propose ownership splits, and negotiate through counter-proposals.

## How to Run the Application

### Prerequisites

Node.js (v16+)
npm (v8+)

### Install dependencies
First the project's dependencies must be installed:

``` bash
npm install
```

Then start a local development server:

``` bash
npm start
```

Open your browser and navigate to http://localhost:4200

### Testing the Application

``` bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

```

### Considerations and Assumptions

### UX:

Angular Material was the choice for the UI framework. Some pages are still missing proper styling, but the overall UX is present.

### Testing Coverage:

Some tests were implemented up to 72% of coverage, but the majority of the services and components are still lacking more coverage.

### Withdraw Proposal:

It was added a withdraw proposal functionality only available to the
user that has issued the proposal.

### Notifications:

Notifications were very rudimentary implemented, some bugs might be
still on but the idea around the functionality is present.

### Data Persistence:

The application uses browser localStorage for data persistence. Data is preserved between sessions but is device-specific. Initial data is loaded from JSON files if localStorage is empty.

### Authentication:

The application simulates user authentication via a user switcher. In a production environment, this would be replaced with proper authentication.

### Performance Considerations:

Observable streams are used for reactive data handling. Filtering is performed client-side which works well for small datasets. For large datasets, server-side filtering would be more appropriate.

### Code Structure:

The application follows a feature-based architecture. Core services handle data management and business logic. Components are focused on presentation and user interaction. Standalone components are used for modularity and better testing.

### Filtering Implementation:

The application implements client-side filtering via the FilterService. This allows for dynamic filtering without server requests. The Filter component can be reused across different views.

#### Browser Compatibility:

The application is tested on modern browsers (Chrome, Firefox, Edge). IE11 support would require additional polyfills.

### Future Enhancements:

- Server-side integration for real persistence
- More advanced filtering options
- User authentication and authorization
- Improve testing coverage