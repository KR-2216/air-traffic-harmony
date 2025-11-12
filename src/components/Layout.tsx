import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plane, LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { signOut, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', roles: ['admin', 'airport_operator', 'airline_staff', 'gate_agent', 'maintenance', 'security'] },
    { to: '/flights', label: 'Flights', roles: ['admin', 'airport_operator', 'airline_staff', 'gate_agent'] },
    { to: '/gates', label: 'Gates & Runways', roles: ['admin', 'airport_operator', 'gate_agent'] },
    { to: '/airports', label: 'Airports', roles: ['admin', 'airport_operator'] },
    { to: '/staff', label: 'Staff', roles: ['admin', 'airline_staff'] },
    { to: '/maintenance', label: 'Maintenance', roles: ['admin', 'maintenance', 'airport_operator'] },
    { to: '/incidents', label: 'Incidents', roles: ['admin', 'security', 'airport_operator'] },
  ];

  const filteredLinks = navLinks.filter(link => 
    link.roles.includes(userRole || '')
  );

  const NavItems = ({ mobile = false }) => (
    <>
      {filteredLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => mobile && setOpen(false)}
          className="text-sm font-medium text-sidebar-foreground hover:text-sidebar-primary transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-sidebar">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">Airport Management</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavItems />
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-sidebar-foreground">
                <span>{user.email}</span>
                {userRole && (
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {userRole.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden sm:flex text-sidebar-foreground hover:text-sidebar-primary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5 text-sidebar-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] bg-sidebar">
                <div className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="flex flex-col gap-2 text-sm text-sidebar-foreground pb-4 border-b border-sidebar-border">
                      <span className="font-medium">{user.email}</span>
                      {userRole && (
                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium w-fit">
                          {userRole.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                  <nav className="flex flex-col gap-3">
                    <NavItems mobile />
                  </nav>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="justify-start text-sidebar-foreground hover:text-sidebar-primary mt-4"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
