// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { LayoutDashboard, Zap, ClipboardList, FileText, Settings } from 'lucide-react';

interface SidebarProps {
    currentTab: string;
    setTab: (tab: string) => void;
}

export function Sidebar({ currentTab, setTab }: SidebarProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'automation', label: 'Automation', icon: Zap },
        { id: 'logs', label: 'Logs', icon: ClipboardList },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    return (
        <aside style={{
            width: '72px',
            backgroundColor: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 0',
            height: '100vh',
            transition: 'width 200ms ease'
        }}>
            {/* Minimal Brand Icon */}
            <div style={{
                width: '32px', height: '32px',
                backgroundColor: 'var(--accent)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF',
                marginBottom: '40px'
            }}>
                <Zap size={16} fill="currentColor" />
            </div>

            {/* Navigation Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                {menuItems.map((item) => {
                    const isActive = currentTab === item.id;
                    const IconComponent = item.icon;
                    const isHovered = hoveredId === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: isActive ? 'var(--border)' : 'transparent',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 200ms ease'
                            }}
                        >
                            <IconComponent size={20} />

                            {/* Hover Tooltip Label */}
                            {isHovered && (
                                <div style={{
                                    position: 'absolute',
                                    left: '60px',
                                    backgroundColor: '#222',
                                    color: '#FFF',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    border: '1px solid #333'
                                }}>
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}