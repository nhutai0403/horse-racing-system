import { useContext } from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { FiBell, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const username = user?.fullName || user?.name || user?.username || user?.email || '';

  // Logic xử lý Avatar: Lấy chữ cái đầu của tên
  // Nếu là "Admin" -> "A", nếu là "Nguyễn Văn An" -> "N"
  const getAvatarLetter = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Nếu bạn có dùng token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="md" variant="dark" className="py-2 shadow-sm" style={{ backgroundColor: '#112211', sticky: 'top', zIndex: 1050 }}>
      <Container fluid="lg">
        {/* LOGO: Đổi từ Equine Elite Pro sang Horse Racing */}
        <Navbar.Brand href="/" className="fw-bold fs-4">
          <span className="text-white">Horse</span> <span style={{ color: '#ffc107' }}>Racing</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="header-nav" />

        <Navbar.Collapse id="header-nav" className="justify-content-between">
          {/* MENU CHÍNH Ở GIỮA */}
          <Nav className="mx-auto gap-lg-4 text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>
            <Nav.Link href="#live" className="text-warning border-bottom border-warning">Live Races</Nav.Link>
            <Nav.Link href="#schedule" className="text-white-50">Schedule</Nav.Link>
            <Nav.Link href="#standings" className="text-white-50">Standings</Nav.Link>
            <Nav.Link href="#marketplace" className="text-white-50">Marketplace</Nav.Link>
          </Nav>

          {/* CỤM TÍNH NĂNG BÊN PHẢI */}
          <div className="d-flex align-items-center gap-3">
            {/* Chuông thông báo */}
            <div className="position-relative cursor-pointer">
              <FiBell size={20} className="text-white-50 hover-white" />
              <Badge 
                bg="warning" 
                pill 
                className="position-absolute rounded-circle" 
                style={{ top: '-2px', right: '-2px', width: '8px', height: '8px', padding: 0 }}
              >
                &nbsp;
              </Badge>
            </div>

            {/* Cài đặt */}
            <FiSettings size={20} className="text-white-50 cursor-pointer hover-white" />

            {/* PHẦN USER: HIỂN THỊ ĐỘNG TÊN TỪ DATABASE/GOOGLE */}
            <div className="d-flex align-items-center gap-2 ms-2 ps-3 border-start border-secondary">
              <div className="text-end d-none d-sm-block">
                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>Welcome back,</div>
                <div className="text-white fw-bold" style={{ fontSize: '0.85rem' }}>
                  {username || 'Guest User'}
                </div>
              </div>

              {/* Avatar hình tròn chứa chữ cái đầu */}
              <NavDropdown
                title={
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold shadow-sm"
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      background: 'linear-gradient(135deg, #198754 0%, #ffc107 100%)',
                      color: '#fff',
                      fontSize: '1rem',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {getAvatarLetter(username || 'G')}
                  </div>
                }
                id="user-dropdown"
                align="end"
                className="no-caret"
              >
                <NavDropdown.Header>Account Actions</NavDropdown.Header>
                <NavDropdown.Item href="#profile">My Profile</NavDropdown.Item>
                <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
                  <FiLogOut /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>

      {/* Thêm một chút CSS inline để xử lý hiệu ứng hover */}
      <style>{`
        .nav-link:hover { color: #fff !important; }
        .hover-white:hover { color: #fff !important; transition: 0.3s; }
        .no-caret .dropdown-toggle::after { display: none; }
        .dropdown-menu { background-color: #fff; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
      `}</style>
    </Navbar>
  );
};

export default Header;