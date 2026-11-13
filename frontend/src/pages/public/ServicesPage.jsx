import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Home, Car, Bike, Building, Store, Package, ArrowRight } from 'lucide-react';
import { contentAPI } from '../../services/api';

const SERVICE_ICONS = {
  Home,
  Car,
  Bike,
  Building,
  Store,
  Package,
  Truck,
};

export const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    contentAPI.getServices()
      .then((res) => {
        if (res.data?.success && res.data.data?.length > 0) {
          setServices(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const displayList = services.length > 0 ? services : defaultServices;

  return (
    <div className="services-page">
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="container">
          <span style={{ color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.8125rem' }}>
            Professional Moving Solutions
          </span>
          <h1 style={{ color: '#FFFFFF', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Our Relocation & Shifting Services
          </h1>
          <p style={{ color: '#E2E8F0', maxWidth: '650px', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Reliable packing and moving solutions for your home, office, and vehicle. Experience safe handling, professional packing, and dependable transportation.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            {displayList.map((service) => {
              const IconComp = SERVICE_ICONS[service.icon] || Truck;
              return (
                <div key={service.slug} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(242, 140, 40, 0.1)',
                      color: 'var(--brand-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <IconComp size={28} />
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{service.title}</h3>
                  <p style={{ fontSize: '0.9375rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>
                    {service.shortDescription}
                  </p>

                  {service.benefits && service.benefits.length > 0 && (
                    <ul style={{ listStyle: 'none', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                      {service.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-orange)' }}></div>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                    <Link to={`/services/${service.slug}`} className="btn btn-outline btn-sm">
                      Detailed Info
                    </Link>
                    <Link to={`/quote?service=${encodeURIComponent(service.title)}`} className="btn btn-primary btn-sm">
                      Get Quote <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

const defaultServices = [
  { title: 'Home Relocation', slug: 'home-relocation', icon: 'Home', shortDescription: 'Complete household shifting solutions with multi-layer protective packaging for your furniture, electronics, and delicate items.', benefits: ['Multi-layer protective packing', 'Furniture dismantling & assembly', 'Specialized glassware boxes'] },
  { title: 'Car Transportation', slug: 'car-transportation', icon: 'Car', shortDescription: 'Safe, enclosed car carrier solutions with wheel-stoppers, specialized tie-downs, and nationwide delivery.', benefits: ['Enclosed & open carrier options', 'Hydraulic ramps & wheel-stoppers', 'Pre-shipment condition reports'] },
  { title: 'Two-Wheeler Transportation', slug: 'two-wheeler-transportation', icon: 'Bike', shortDescription: 'Scratch-resistant wooden crate and corrugated bubble packaging for motorcycles, scooters, and premium bikes.', benefits: ['Scratch-proof foam & bubble wrap', 'Mirror and indicator guards', 'Doorstep pickup & delivery'] },
  { title: 'Office Relocation', slug: 'office-relocation', icon: 'Building', shortDescription: 'Structured commercial shifting with minimal operational downtime for IT equipment, files, and workstations.', benefits: ['Department-wise color coding', 'Anti-static wraps for IT hardware', 'Weekend & overnight moving'] },
  { title: 'Shop Relocation', slug: 'shop-relocation', icon: 'Store', shortDescription: 'Efficient retail and showroom moving for retail merchandise, display counters, racks, and inventory.', benefits: ['Inventory count verification', 'Padded glass display protection', 'Fast commercial turnaround'] },
  { title: 'Packing and Moving', slug: 'packing-and-moving', icon: 'Package', shortDescription: 'End-to-end relocation services combining industrial-grade packing materials with experienced handlers.', benefits: ['5-ply & 7-ply heavy cartons', 'Professional packing crew', 'Transparent price breakdown'] },
  { title: 'Loading and Unloading', slug: 'loading-and-unloading', icon: 'Truck', shortDescription: 'Trained, physically skilled laborers using moving dollies, lifting belts, and protective floor blankets.', benefits: ['Heavy lifting straps', 'Corner & staircase protection', 'Systematic truck distribution'] },
  { title: 'Door-to-Door Transportation', slug: 'door-to-door-transportation', icon: 'Truck', shortDescription: 'Direct transport from your current doorstep directly to your destination across Rajasthan and pan-India.', benefits: ['Direct point-to-point transit', 'Zero warehouse offloading risk', 'All-India transport permit'] },
];

export default ServicesPage;

