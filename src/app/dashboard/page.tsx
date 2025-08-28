// app/dashboard/page.tsx
import DashboardContent from './DashboardContent';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Make the component async
export default async function DashboardPage() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get('token')?.value;

  if (token !== 'loggedin') {
    redirect('/'); 
  }

  return <DashboardContent />;
}
