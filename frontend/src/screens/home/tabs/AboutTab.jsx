import React from 'react';

const AboutTab = () => {
  return (
    <div data-name="about-tab" style={{ background: '#f8f9fa', padding: '1.5rem 0.5rem 2rem' }}>
      <div className="card border-0 shadow-sm">
        <div
          className="card-header py-3 border-0"
          style={{ background: '#1a2e4a' }}
        >
          <h5 className="mb-0 text-white fw-semibold">About</h5>
        </div>
        <div className="card-body p-4">
          <p className="text-muted mb-4">
            This is a web application that allows you to view existing
            reservations and to create new ones.
          </p>
          <div className="text-center">
            <img
              width={1000}
              height={750}
              src="/img/default-bkg.jpg"
              alt="Thumbnail [1000x750]"
              className="img-fluid rounded"
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
