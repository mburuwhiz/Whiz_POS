import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePosStore } from '../store/posStore';
import { Store, Coffee, BarChart3, Users, Calendar, Settings, DollarSign, Database, Package, Gift, Camera, Activity, Building2, UserCheck, Printer } from 'lucide-react';

/**
 * Helper component to group navigation links with a title.
 *
 * @param {object} props
 * @param {string} props.title - The title of the navigation group.
 * @param {React.ReactNode} props.children - The navigation links to display within the group.
 */
const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

/**
 * Main Navigation Sidebar component.
 * Displays navigation links based on the user's role (admin/manager vs cashier).
 * Uses `NavLink` for client-side routing with active state styling.
 */
const Navigation = ({ onClose }: { onClose?: () => void }) => {
  const { businessSetup, currentCashier } = usePosStore();

  // Do not render navigation if business is not set up
  if (!businessSetup?.isSetup) {
    return null;
  }

  const userRole = currentCashier?.role;
  const isAdminOrManager = userRole === 'admin' || userRole === 'manager';

  /**
   * Computes class names for navigation links.
   * Applies active styling if the link matches the current route.
   *
   * @param {object} props - Render props from NavLink.
   * @param {boolean} props.isActive - Whether the link is currently active.
   * @returns {string} The constructed class string.
   */
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-gray-600 hover:bg-sky-100 hover:text-sky-600'
    }`;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-64 h-full bg-white shadow-md flex flex-col">
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Store className="w-8 h-8 text-sky-500" />
          <span className="font-bold text-xl text-gray-800">WHIZ POS</span>
        </div>
      </div>
      <nav className="p-4 space-y-4 flex-1 overflow-y-auto">
        <NavGroup title="Point of Sale">
          <NavLink to="/" className={navLinkClasses} onClick={handleNavClick}>
            <Coffee className="w-5 h-5" />
            <span>POS</span>
          </NavLink>
          <NavLink to="/customers" className={navLinkClasses} onClick={handleNavClick}>
            <Users className="w-5 h-5" />
            <span>Credits</span>
          </NavLink>
          <NavLink to="/previous-receipts" className={navLinkClasses} onClick={handleNavClick}>
            <Printer className="w-5 h-5" />
            <span>Old Receipts</span>
          </NavLink>
        </NavGroup>

        {isAdminOrManager && (
          <NavGroup title="Analytics">
            <NavLink to="/dashboard" className={navLinkClasses} onClick={handleNavClick}>
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/reports" className={navLinkClasses} onClick={handleNavClick}>
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/closing" className={navLinkClasses} onClick={handleNavClick}>
              <Calendar className="w-5 h-5" />
              <span>Closing</span>
            </NavLink>
          </NavGroup>
        )}

        <NavGroup title="Management">
          <NavLink to="/expenses" className={navLinkClasses} onClick={handleNavClick}>
            <DollarSign className="w-5 h-5" />
            <span>Expenses</span>
          </NavLink>
          <NavLink to="/loyalty" className={navLinkClasses} onClick={handleNavClick}>
            <Gift className="w-5 h-5" />
            <span>Loyalty</span>
          </NavLink>
        </NavGroup>

        {isAdminOrManager && (
          <NavGroup title="Administration">
            <NavLink to="/backoffice" className={navLinkClasses} onClick={handleNavClick}>
              <UserCheck className="w-5 h-5" />
              <span>Back Office</span>
            </NavLink>
            <NavLink to="/register" className={navLinkClasses} onClick={handleNavClick}>
              <Building2 className="w-5 h-5" />
              <span>Register</span>
            </NavLink>
            <NavLink to="/sync" className={navLinkClasses} onClick={handleNavClick}>
              <Database className="w-5 h-5" />
              <span>Sync</span>
            </NavLink>
            <NavLink to="/manage" className={navLinkClasses} onClick={handleNavClick}>
              <Settings className="w-5 h-5" />
              <span>Manage</span>
            </NavLink>
          </NavGroup>
        )}

        <NavGroup title="Tools">
            <NavLink to="/scanner" className={navLinkClasses} onClick={handleNavClick}>
                <Camera className="w-5 h-5" />
                <span>Scanner</span>
            </NavLink>
        </NavGroup>
      </nav>
    </div>
  );
};

export default Navigation;
