import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductListPage from './pages/ProductListPage';
import WalletPage from './pages/WalletPage';

// Placeholder components for routes not yet fully implemented
import ProductDetailPage from './pages/ProductDetailPage';

// Placeholder components for routes not yet fully implemented
import SignupPage from './pages/SignupPage';
// const SignupPage = () => <div className="card"><h1>회원가입</h1><p>회원가입 페이지입니다.</p></div>;
import CartPage from './pages/CartPage';
// const CartPage = () => <div className="card"><h1>장바구니</h1><p>장바구니가 비어있습니다.</p></div>;
import MyPage from './pages/MyPage';
// const MyPage = () => <div className="card"><h1>마이페이지</h1><p>사용자 정보입니다.</p></div>;
// const ProductDetail = () => <div className="card"><h1>상품 상세</h1><p>상품 상세 정보입니다.</p></div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="market" element={<ProductListPage />} />
        <Route path="market/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="mypage" element={<MyPage />} />
        <Route path="wallet" element={<WalletPage />} />
      </Route>
    </Routes>
  );
}

export default App;
