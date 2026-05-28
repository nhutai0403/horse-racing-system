import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-light w-full">
      {/* Khối 1: Danh sách các đối tác cao cấp (Phủ mờ sang trọng) */}
      <div className="border-bottom border-light py-4">
        <Container fluid="md">
          <Row className="justify-content-between align-items-center text-center text-muted fw-bold g-3" style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer text-hover-dark">ROLEX</Col>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer text-hover-dark">LONGINES</Col>
            <Col xs={6} sm={4} md="auto" className="text-uppercase cursor-pointer text-hover-dark">DUBAI AIR</Col>
            <Col xs={6} sm={6} md="auto" className="text-uppercase cursor-pointer text-hover-dark">NETJETS</Col>
            <Col xs={12} sm={6} md="auto" className="text-uppercase cursor-pointer text-hover-dark">ST. JAMES</Col>
          </Row>
        </Container>
      </div>

      {/* Khối 2: Thông tin bản quyền và link điều khoản */}
      <div className="py-4">
        <Container fluid="md">
          <Row className="align-items-center justify-content-between text-center text-md-start g-3" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            {/* Tên App mới đổi ở góc trái */}
            <Col xs={12} md="auto" className="fw-bold text-dark h6 mb-0">
              Horse <span className="text-success">Racing</span>
            </Col>

            {/* Bản quyền */}
            <Col xs={12} md="auto" className="text-muted">
              © {new Date().getFullYear()} Horse Racing Tournament Management. All Rights Reserved.
            </Col>

            {/* Các liên kết điều khoản */}
            <Col xs={12} md="auto">
              <div className="d-flex justify-content-center justify-content-md-end gap-4 text-muted">
                <a href="#privacy" className="text-decoration-none text-reset text-hover-dark">Privacy Policy</a>
                <a href="#terms" className="text-decoration-none text-reset text-hover-dark">Terms of Service</a>
                <a href="#broadcast" className="text-decoration-none text-reset text-hover-dark">Broadcast Guidelines</a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;