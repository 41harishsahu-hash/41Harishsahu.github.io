import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Home, Car, Bike, Building, Store, Package, CheckCircle, HelpCircle, ArrowRight, Phone, Shield } from 'lucide-react';
import { contentAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/CommonUI';

const SERVICE_ICONS = {
  Home,
  Car,
  Bike,
  Building,
  Store,
  Package,
  Truck,
};

export const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    contentAPI.getServiceBySlug(slug)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setService(res.data.data);
        } else {
          setService(fallbackServices[slug] || null);
        }
      })
      .catch(() => {
        setService(fallbackServices[slug] || null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading service details..." />;

  if (!service) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Service Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0' }}>The requested relocation service could not be located.</p>
        <Link to="/services" className="btn btn-primary">Browse All Services</Link>
      </div>
    );
  }

  const IconComp = SERVICE_ICONS[service.icon] || Truck;

  return (
    <div className="service-detail-page">
      {/* Service Header Banner */}
      <section style={{ backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="container">
          <Link to="/services" style={{ color: 'var(--brand-orange)', fontSize: '0.875rem', fontWeight: 600, display: 'inline-block', marginBottom: '0.75rem' }}>
            ← Back to All Services
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComp size={30} color="var(--brand-orange)" />
            </div>
            <div>
              <h1 style={{ color: '#FFFFFF', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', margin: 0 }}>
                {service.title}
              </h1>
              <p style={{ color: '#CBD5E1', marginTop: '0.25rem' }}>Professional Relocation by History Packers & Movers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
            {/* Left Column: Details */}
            <div style={{ flex: 2 }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Service Overview</h2>
              <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                {service.fullDescription || service.shortDescription}
              </p>

              {/* Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Key Benefits & Features</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
                    {service.benefits.map((benefit, i) => (
                      <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem' }}>
                        <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Steps */}
              {service.processSteps && service.processSteps.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Our Execution Process</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {service.processSteps.map((step, idx) => (
                      <div key={idx} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                          {step.stepNumber || idx + 1}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>{step.title}</strong>
                          <p style={{ fontSize: '0.875rem', margin: 0 }}>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service FAQs */}
              {service.faqs && service.faqs.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Frequently Asked Questions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {service.faqs.map((f, i) => (
                      <div key={i} className="card" style={{ padding: '1.25rem' }}>
                        <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>{f.question}</strong>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: CTA Box & Quick Contact */}
            <div style={{ position: 'sticky', top: '5.5rem' }}>
              <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--brand-navy)' }}>Book {service.title}</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Get an upfront, transparent estimate tailored to your volume and relocation schedule.
                </p>

                <Link to={`/quote?service=${encodeURIComponent(service.title)}`} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                  Get Free Estimate <ArrowRight size={16} />
                </Link>

                <a href="tel:+919251273070" className="btn btn-outline" style={{ width: '100%' }}>
                  <Phone size={16} /> Call +91 9251273070
                </a>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Shield size={14} color="var(--brand-orange)" />
                    <span>Multi-layer protective packing</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={14} color="var(--success)" />
                    <span>Door-to-door transit verification</span>
                  </div>
                </div>
              </div>

              {/* Related Services */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--brand-navy)' }}>Other Shifting Services</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <li><Link to="/services/home-relocation">→ Home Relocation</Link></li>
                  <li><Link to="/services/car-transportation">→ Car Transportation</Link></li>
                  <li><Link to="/services/two-wheeler-transportation">→ Two-Wheeler Transportation</Link></li>
                  <li><Link to="/services/office-relocation">→ Office Relocation</Link></li>
                  <li><Link to="/services/packing-and-moving">→ Packing and Moving</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const fallbackServices = {
  'home-relocation': {
    title: 'Home Relocation',
    slug: 'home-relocation',
    icon: 'Home',
    shortDescription: 'Complete household shifting solutions with multi-layer protective packaging for your furniture, electronics, and delicate items.',
    fullDescription: 'Our Home Relocation service provides comprehensive household shifting designed to ensure your belongings reach your new residence safely. From fragile kitchenware to bulky wooden wardrobes, our trained packing staff wraps each item using premium corrugated sheets, bubble wrap, and stretch film.',
    benefits: [
      'Multi-layer protective packing for fragile items',
      'Dismantling and reassembly of large furniture',
      'Specialized boxes for crockery and glassware',
      'Clean, covered transport vehicles designed for household goods',
      'Direct door-to-door delivery with zero transshipment risk',
    ],
    processSteps: [
      { stepNumber: 1, title: 'Survey & Estimate', description: 'Detailed inspection of your items to calculate packing materials and provide an honest estimate.' },
      { stepNumber: 2, title: 'Professional Packing', description: 'Our trained crew carefully packs every household item using industry-grade materials.' },
      { stepNumber: 3, title: 'Careful Loading & Transit', description: 'Systematic loading into covered trucks with shock-resistant cushioning for smooth transit.' },
      { stepNumber: 4, title: 'Unloading & Placement', description: 'Safe unloading at your new home with placement of furniture in designated rooms.' },
    ],
    faqs: [
      { question: 'How much in advance should I book home relocation?', answer: 'We recommend booking 2 to 4 days in advance for local shifting, and 5 to 7 days for inter-city moving.' },
      { question: 'Do you provide cartons and bubble wraps?', answer: 'Yes, our team brings all required packing materials including corrugated boxes, bubble wrap, corner guards, and tape.' },
    ],
  },
  'car-transportation': {
    title: 'Car Transportation',
    slug: 'car-transportation',
    icon: 'Car',
    shortDescription: 'Safe, enclosed car carrier solutions with wheel-stoppers, specialized tie-downs, and nationwide delivery.',
    fullDescription: 'Car transportation requires specialized carriers and careful securing. History Packers & Movers offers dedicated single and multi-vehicle covered carriers to move your car without adding unnecessary mileage or risking highway gravel damage.',
    benefits: [
      'Enclosed and open carrier options available',
      'Hydraulic ramps and heavy-duty wheel-stoppers',
      'Vehicle inspection report prior to loading',
      'Door-to-door pickup and delivery',
      'Regular transit tracking updates',
    ],
    processSteps: [
      { stepNumber: 1, title: 'Condition Inspection', description: 'Pre-shipment vehicle inspection and odometer recording with photo documentation.' },
      { stepNumber: 2, title: 'Secure Carrier Loading', description: 'Loading via safety ramps and securing with 4-point wheel harnesses.' },
      { stepNumber: 3, title: 'Express Highway Transit', description: 'Experienced drivers navigate optimal national highway routes.' },
      { stepNumber: 4, title: 'Handover & Verification', description: 'Inspection upon delivery at your doorstep and handover of vehicle keys.' },
    ],
    faqs: [
      { question: 'Can I leave personal belongings inside the car during transit?', answer: 'We advise keeping personal valuables with you. Small household cartons may be permitted upon prior inspection.' },
    ],
  },
};

export default ServiceDetailPage;

