import { Button } from '@/components/ui/button';
import React from 'react';

const AdminUsers: React.FC = () => {
  return (
    <div>
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  );
};

export default AdminUsers;
