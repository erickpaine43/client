'use client'; 

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

// Load the generated spec from the public folder
const specUrl = '/hostwinds-spec.json';

export default function HostwindsApiDocsPage() {
  return (
    <div className="p-5">
      <h1>Hostwinds API Documentation</h1>
      <SwaggerUI 
        url={specUrl} 
        docExpansion="list" 
        tryItOutEnabled={true} 
      />
    </div>
  );
}
