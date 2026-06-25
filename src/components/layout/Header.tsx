'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import * as Icon from '@/components/ui/Icons';
import type { NavCategory } from '@/lib/nav';

export type { NavCategory, NavSubcategory } from '@/lib/nav';

const LOGO = '/design/logo-blanco-trim.png';

export function Header({
  loggedIn,
  categories,
}: {
  loggedIn: boolean;
  categories: NavCategory[];
}) {
  const router = useRouter();
  const [openCat, setOpenCat] = React.useState<string | null>(null);
  const [drawer, setDrawer] = React.useState(false);
  const [query, setQuery] = React.useState('');

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
  }

  return (
    <header
      style={{ position: 'sticky', top: 0, zIndex: 40 }}
      onMouseLeave={() => setOpenCat(null)}
    >
      <div
        style={{
          background: 'var(--gt-charcoal)',
          borderBottom: '1px solid var(--border-dark)',
        }}
      >
        <div
          className="gt-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '14px 24px',
          }}
        >
          <button
            className="gt-only-mobile"
            onClick={() => setDrawer(true)}
            aria-label="Menú"
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Icon.Menu size={26} />
          </button>
          <Link
            href="/"
            aria-label="Global Trade — Inicio"
            style={{ display: 'inline-flex' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO}
              alt="Global Trade"
              className="gt-logo"
              style={{ height: 48 }}
            />
          </Link>
          <form
            onSubmit={submitSearch}
            className="gt-hide-mobile"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--gt-black)',
              border: '1px solid var(--border-dark)',
              borderRadius: 'var(--radius-2)',
              padding: '0 14px',
              height: 44,
              maxWidth: 420,
            }}
          >
            <button
              type="submit"
              aria-label="Buscar"
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <Icon.Search size={18} />
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, SKU…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: 'var(--font-brand)',
                fontSize: 14,
              }}
            />
          </form>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Link
              href="/contacto"
              className="gt-hide-mobile"
              style={{
                textDecoration: 'none',
                color: 'var(--text-body)',
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Icon.Phone size={15} /> Contacto
            </Link>
            {loggedIn ? (
              <Button
                href="/cuenta"
                variant="ghost"
                size="sm"
                iconLeft={<Icon.User size={16} />}
              >
                Mi cuenta
              </Button>
            ) : (
              <Button
                href="/ingresar"
                variant="primary"
                size="sm"
                iconLeft={<Icon.User size={16} />}
              >
                Ingresar
              </Button>
            )}
          </div>
        </div>

        <div
          className="gt-hide-mobile"
          style={{
            background: 'var(--gt-charcoal-2)',
            borderTop: '1px solid var(--border-dark)',
          }}
        >
          <div
            className="gt-container"
            style={{
              padding: '0 24px',
              display: 'flex',
              gap: 2,
              position: 'relative',
            }}
          >
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                onMouseEnter={() => setOpenCat(c.key)}
                style={{
                  textDecoration: 'none',
                  padding: '14px 18px',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: openCat === c.key ? '#fff' : 'var(--text-body)',
                  borderBottom: `3px solid ${openCat === c.key ? 'var(--gt-orange)' : 'transparent'}`,
                }}
              >
                {c.name}
              </Link>
            ))}
            <span
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                color: 'var(--text-muted)',
                fontSize: 12.5,
              }}
            >
              <Icon.MapPin size={14} /> Envíos a todo el país
            </span>

            {openCat &&
              (() => {
                const c = categories.find((x) => x.key === openCat);
                if (!c) return null;
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '100%',
                      background: 'var(--gt-charcoal)',
                      borderTop: '1px solid var(--border-dark)',
                      borderBottom: '3px solid var(--gt-orange)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1.1fr',
                        gap: 32,
                        padding: '28px 24px',
                      }}
                    >
                      <div
                        style={{
                          gridColumn: 'span 2',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '10px 24px',
                        }}
                      >
                        {c.sub.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            style={{
                              textDecoration: 'none',
                              color: 'var(--text-body)',
                              fontSize: 14,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 0',
                            }}
                          >
                            <Icon.ChevronRight size={13} /> {s.name}
                          </Link>
                        ))}
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-2)',
                          overflow: 'hidden',
                          minHeight: 150,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt=""
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'var(--overlay-scrim)',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: 16,
                            bottom: 14,
                            right: 16,
                          }}
                        >
                          <div
                            style={{
                              color: '#fff',
                              fontFamily: 'var(--font-brand)',
                              fontWeight: 800,
                              fontSize: 18,
                              textTransform: 'uppercase',
                            }}
                          >
                            {c.name}
                          </div>
                          {c.blurb && (
                            <div
                              style={{
                                color: 'var(--gt-gray-light)',
                                fontSize: 13,
                              }}
                            >
                              {c.blurb}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>

      {drawer && (
        <div
          onClick={() => setDrawer(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,.6)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '84%',
              maxWidth: 340,
              background: 'var(--gt-charcoal)',
              borderRight: '3px solid var(--gt-orange)',
              padding: 20,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="Global Trade" style={{ height: 40 }} />
              <button
                onClick={() => setDrawer(false)}
                aria-label="Cerrar"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <Icon.X size={24} />
              </button>
            </div>
            {categories.map((c) => (
              <div
                key={c.key}
                style={{
                  borderBottom: '1px solid var(--border-dark)',
                  padding: '8px 0',
                }}
              >
                <Link
                  href={c.href}
                  style={{
                    textDecoration: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-brand)',
                    fontWeight: 800,
                    fontSize: 15,
                    textTransform: 'uppercase',
                    padding: '8px 0',
                    display: 'block',
                  }}
                >
                  {c.name}
                </Link>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px 16px',
                    paddingBottom: 8,
                  }}
                >
                  {c.sub.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 13.5,
                      }}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
