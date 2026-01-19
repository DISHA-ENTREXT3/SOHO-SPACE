
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
    RocketLaunchIcon, UserCircleIcon, BellIcon, Cog6ToothIcon, 
    ChevronDownIcon, SparklesIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, 
    UserIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon 
} from './Icons';
import Avatar from './Avatar';

const Header = () => {
    const { user, logout } = useAuth();
    const { getNotificationsForUser, markNotificationAsRead } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    const notificationsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const userNotifications = user ? getNotificationsForUser(user.id) : [];
    const unreadCount = userNotifications.filter(n => !n.read).length;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const handleNotificationClick = (notificationId: string) => {
        markNotificationAsRead(notificationId);
        setNotificationsOpen(false);
    };

    const scrollToSection = (sectionId: string) => {
        setMobileMenuOpen(false);
        if (!isHomePage) {
            const landingParam = user ? 'landing=true&' : '';
            navigate('/' + (sectionId ? '?' + landingParam + 'scroll=' + sectionId : ''));
            return;
        }
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = 64; // h-16 is 64px
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // Handle initial scroll if coming from another page
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const scrollId = queryParams.get('scroll');
        if (scrollId && isHomePage) {
            // Small delay to ensure page is rendered
            const timer = setTimeout(() => {
                scrollToSection(scrollId);
                // Clean up URL
                navigate('/', { replace: true });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isHomePage, location.search, navigate]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'How it Works', action: () => scrollToSection('how-it-works') },
        { name: 'Features', action: () => scrollToSection('features') },
        { name: 'Discover', path: '/discover' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Feedback', path: '/feedback' },
    ];

    const textColorClass = scrolled || !isHomePage || theme === 'light' ? 'text-[var(--text-primary)]' : 'text-gray-100';
    const subTextColorClass = scrolled || !isHomePage || theme === 'light' ? 'text-[var(--text-secondary)]' : 'text-gray-400';

    return (
        <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
            scrolled || !isHomePage || mobileMenuOpen
                ? 'bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--glass-border)] shadow-lg' 
                : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to={user ? "/?landing=true" : "/"} className="flex items-center group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 p-1">
                                <img src="/logo.png" alt="Soho Space Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className={`ml-3 text-lg font-bold tracking-tight leading-none ${textColorClass}`}>
                                Soho <span className="text-indigo-400">Space</span>
                                <span className="block text-[9px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">The Growth Atelier</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-6 mx-8">
                        {navLinks.map((link, idx) => (
                            link.path ? (
                                <Link 
                                    key={idx}
                                    to={link.path} 
                                    className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-indigo-400' : `${subTextColorClass} hover:text-indigo-400`}`}
                                >
                                    {link.name}
                                </Link>
                            ) : (
                                <button 
                                    key={idx}
                                    onClick={link.action}
                                    className={`text-sm font-medium transition-colors ${subTextColorClass} hover:text-indigo-400`}
                                >
                                    {link.name}
                                </button>
                            )
                        ))}

                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all ${subTextColorClass} hover:text-indigo-400 hover:bg-white/5`}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </button>

                        {/* Mobile Menu Button */}
                        <button 
                            className={`lg:hidden p-2 rounded-lg transition-all ${subTextColorClass} hover:text-indigo-400 hover:bg-white/5`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>

                        {/* Desktop User Actions (Hidden on Mobile) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user ? (
                                <>
                                    <Link 
                                        to="/dashboard" 
                                        className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                                            location.pathname === '/dashboard' 
                                                ? 'text-white bg-indigo-600' 
                                                : `${subTextColorClass} hover:text-indigo-400 hover:bg-white/5`
                                        }`}
                                    >
                                        Dashboard
                                    </Link>

                                    {user.role === UserRole.ADMIN && (
                                        <Link 
                                            to="/admin" 
                                            className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 font-medium text-sm px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                                        >
                                            <ShieldCheckIcon className="h-4 w-4"/>
                                            <span>Admin</span>
                                        </Link>
                                    )}

                                    {/* Notifications */}
                                    <div className="relative" ref={notificationsRef}>
                                        <button 
                                            onClick={() => setNotificationsOpen(!notificationsOpen)} 
                                            className={`relative p-2.5 rounded-lg transition-all duration-200 ${
                                                notificationsOpen 
                                                    ? 'bg-indigo-500/10 text-indigo-400' 
                                                    : `${subTextColorClass} hover:text-indigo-400 hover:bg-white/5`
                                            }`}
                                        >
                                            <BellIcon className="h-5 w-5"/>
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-gray-900 animate-pulse" />
                                            )}
                                        </button>

                                        {notificationsOpen && (
                                            <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-secondary)] backdrop-blur-xl rounded-xl shadow-xl border border-[var(--glass-border)] overflow-hidden">
                                                <div className="px-4 py-3 border-b border-[var(--glass-border)] flex items-center justify-between">
                                                    <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                                                            {unreadCount} new
                                                        </span>
                                                    )}
                                                </div>
                                                <ul className="max-h-80 overflow-y-auto">
                                                    {userNotifications.length > 0 ? userNotifications.slice(0, 5).map(n => (
                                                        <li key={n.id}>
                                                            <Link 
                                                                to={n.link} 
                                                                onClick={() => handleNotificationClick(n.id)} 
                                                                className={`block px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)] ${!n.read ? 'bg-indigo-500/5' : ''}`}
                                                            >
                                                                <p className={`text-sm ${!n.read ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                                                                    {n.message}
                                                                </p>
                                                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                                                    {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : 'Recent'}
                                                                </p>
                                                            </Link>
                                                        </li>
                                                    )) : (
                                                        <li className="p-6 text-center">
                                                            <BellIcon className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                                                            <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="relative" ref={profileRef}>
                                        <button 
                                            onClick={() => setProfileOpen(!profileOpen)} 
                                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 ${
                                                profileOpen 
                                                    ? 'bg-white/10' 
                                                    : 'hover:bg-white/5'
                                            }`}
                                        >
                                            <Avatar 
                                                src={user.avatarUrl} 
                                                name={user.name} 
                                                size="sm"
                                                className="ring-2 ring-white/10"
                                            />
                                            <ChevronDownIcon className={`h-4 w-4 ${subTextColorClass} transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {profileOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] backdrop-blur-xl rounded-xl shadow-xl border border-[var(--glass-border)] overflow-hidden">
                                                <div className="px-4 py-3 border-b border-[var(--glass-border)]">
                                                    <p className="font-semibold text-[var(--text-primary)] text-sm truncate">{user.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                                                </div>

                                                <div className="py-2">
                                                    <Link 
                                                        to={user.role === UserRole.PARTNER ? `/partner/${user.profileId}` : `/company/${user.profileId}`} 
                                                        onClick={() => setProfileOpen(false)} 
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                                                    >
                                                        <UserIcon className="h-4 w-4" />
                                                        View Profile
                                                    </Link>
                                                    <Link 
                                                        to="/settings" 
                                                        onClick={() => setProfileOpen(false)} 
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                                                    >
                                                        <Cog6ToothIcon className="h-4 w-4" />
                                                        Settings
                                                    </Link>
                                                </div>

                                                <div className="border-t border-[var(--glass-border)] py-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    >
                                                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className={`text-sm font-medium transition-colors px-4 py-2 ${subTextColorClass} hover:text-indigo-400`}
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/login?mode=signup" 
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-[var(--glass-border)] bg-[var(--bg-primary)] px-4 pt-4 pb-6 shadow-xl animate-fade-in-up">
                    <div className="space-y-4">
                        {user && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] mb-4">
                                <Avatar 
                                    src={user.avatarUrl} 
                                    name={user.name} 
                                    size="sm"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            {navLinks.map((link, idx) => (
                                link.path ? (
                                    <Link 
                                        key={idx}
                                        to={link.path} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <button 
                                        key={idx}
                                        onClick={link.action}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                                    >
                                        {link.name}
                                    </button>
                                )
                            ))}

                        </div>
                        
                        <div className="pt-4 border-t border-[var(--glass-border)] space-y-2">
                             {user ? (
                                <>
                                    <Link 
                                        to="/dashboard" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-secondary)] rounded-md"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        to={user.role === UserRole.PARTNER ? `/partner/${user.profileId}` : `/company/${user.profileId}`} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-secondary)] rounded-md"
                                    >
                                        Profile
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-[var(--bg-secondary)] rounded-md"
                                    >
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-rose-400 hover:bg-rose-500/10 rounded-md"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 mt-4">
                                     <Link 
                                        to="/login" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/login?mode=signup" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-colors shadow-lg shadow-indigo-500/25"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;