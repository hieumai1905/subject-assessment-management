import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Head from "../layout/head/Head";
import Content from "../layout/content/Content";
import {
  Block,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Row,
  Col,
  BlockBetween,
} from "../components/Component";
import ImageContainer from "../components/partials/gallery/GalleryImage";
import "animate.css";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaGoogle } from "react-icons/fa";

const Testimonial = styled.div`
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid #d3d3d3;
  padding: 20px;
  overflow: hidden;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 4px;
    background-color: ${(props) => props.color || "#000"};
    transition: width 0.4s ease;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:hover::after {
    width: 100%;
  }

  img {
    border-radius: 50%;
    margin-bottom: 10px;
    width: 60px;
    height: 60px;
  }
`;

const FeatureCard = styled.div`
  background-color: #f0f8ff;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #d3d3d3;
  transition: transform 0.2s, box-shadow 0.2s;
  padding: 20px;
  border-radius: 8px;
  text-align: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
  }

  h5 {
    font-size: 1.3rem;
  }

  p {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  a {
    margin-top: auto;
    text-decoration: none;
    color: #007bff;
  }
`;

const Title = styled(BlockTitle)`
  position: relative;
  padding-bottom: 10px;
  margin-bottom: 20px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background-color: #007bff;
  }
`;

const PartnerImage = styled(ImageContainer)`
  width: 60%;
  height: auto;
  border-radius: 8px;
  transition: transform 0.4s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const BackToTopButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px 23px;
  font-size: 1.5rem;
  cursor: pointer;
  display: ${(props) => (props.visible ? "block" : "none")};
  z-index: 1000;

  &:hover {
    background-color: #0056b3;
  }
`;
const FooterContainer = styled.footer`
  background-color: #1f2b3a; /* Màu nền đồng bộ với sidebar */
  color: #ffffff; /* Màu chữ trắng */
  padding: 40px 20px;
  margin-top: 50px;
`;

const FooterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
`;

const FooterColumn = styled.div`
  flex: 1;
  min-width: 200px;

  h4 {
    font-size: 1.3rem;
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 10px;
    color: #6f7dbb;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 4px;
      background-color: #6f7dbb;
    }
  }

  p,
  li,
  a {
    font-size: 1rem;
    line-height: 1.5;
    color: #c3c6cf;

    &:hover {
      color: #6f7dbb;
    }
  }

  ul {
    list-style: none;
    padding: 0;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 15px;

  a {
    color: #ffffff;
    font-size: 1.5rem;
    transition: color 0.3s;

    &:hover {
      color: #007bff;
    }
  }
`;
const FooterBottom = styled.div`
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #007bff;
  margin-top: 30px;
  color: #c3c6cf;
`;

const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;

  input[type="email"] {
    padding: 10px;
    border: 1px solid #d3d3d3;
    border-radius: 5px;
    font-size: 1rem;
  }

  button {
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;
const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      <Head title="Trang chủ" />
      <Content>
        <BlockHead size="sm" className="p-4 rounded animate__animated animate__fadeInDown">
          <BlockBetween>
            <BlockHeadContent>
              <Title page tag="h2" className="text-dark" style={{ fontSize: "2rem" }}>
                Hệ Thống Đánh Giá và Chấm Điểm Dự Án Lab
              </Title>
              <BlockDes>
                <p className="text-dark" style={{ fontSize: "1.2rem" }}>
                  Chào mừng đến với Hệ Thống Đánh Giá
                </p>
              </BlockDes>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Phần giới thiệu */}
        {/* <Block className="mt-5 animate__animated animate__fadeInUp text-center">
          <ImageContainer
            img={OIPAA}
            style={{ width: "50%", height: "60px", borderRadius: "8px", objectFit: "cover" }}
          />
        </Block> */}

        {/* Phần tính năng */}
        <Block className="mt-5 animate__animated animate__fadeInUp">
          <BlockHeadContent className="text-center mb-4">
            <Title tag="h4" style={{ fontSize: "1.5rem" }}>
              Tính Năng
            </Title>
            <BlockDes>
              <p style={{ fontSize: "1.2rem" }}>Khám phá các tính năng chính của nền tảng:</p>
            </BlockDes>
          </BlockHeadContent>
          <Row className="g-gs text-center">
            <Col md="3">
              <FeatureCard>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRAXFPBNQyXTlEfNf8vVgJi2j0EKtuv0tYWQ&s"
                  alt="Chấm điểm tự động"
                />
                <h5>Chấm điểm tự động</h5>
                <p>Tiết kiệm thời gian với hệ thống chấm điểm tự động, đảm bảo kết quả nhanh chóng và chính xác.</p>
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img src="https://cdn-icons-png.freepik.com/512/8437/8437070.png" alt="Phản hồi chi tiết" />
                <h5>Phản hồi chi tiết</h5>
                <p>Nhận phản hồi chi tiết giúp bạn hiểu rõ điểm mạnh và các khía cạnh cần cải thiện.</p>
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img src="https://cdn-icons-png.flaticon.com/512/463/463662.png" alt="Bảo mật và đáng tin cậy" />
                <h5>Bảo mật và đáng tin cậy</h5>
                <p>Dữ liệu của bạn được bảo vệ với các tiêu chuẩn bảo mật cao nhất để đảm bảo quyền riêng tư.</p>
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img
                  src="https://www.pngitem.com/pimgs/m/621-6210821_rr-icon-recovery-new-tektronix-logo-hd-png.png"
                  alt="Dễ sử dụng"
                />
                <h5>Dễ sử dụng</h5>
                <p>Giao diện thân thiện, dễ sử dụng và tương tác với hệ thống!</p>
              </FeatureCard>
            </Col>
          </Row>
        </Block>

        {/* Phần đánh giá của người dùng */}
        <Block
          className="mt-5 p-4 rounded animate__animated animate__fadeInUp testimonials-section"
          style={{
            backgroundImage: `url('/mnt/data/image.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <BlockHeadContent className="text-center mb-5">
            <Title tag="h4" style={{ fontSize: "1.5rem" }}>
              Đánh Giá Từ Người Dùng
            </Title>
            <BlockDes>
              <p style={{ fontSize: "1.2rem" }}>Những gì người dùng của chúng tôi nói:</p>
            </BlockDes>
          </BlockHeadContent>
          <Row className="g-gs">
            <Col md="4">
              <Testimonial color="#FF6347">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Người dùng" />
                <p style={{ fontSize: "1rem" }}>
                  "Hệ thống chấm điểm đã cải thiện đáng kể quy trình làm việc và tiết kiệm rất nhiều thời gian."
                </p>
                <p>
                  <strong>- Vũ Minh Long (GV_UTC), Giảng viên</strong>
                </p>
              </Testimonial>
            </Col>
            <Col md="4">
              <Testimonial color="#4682B4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Người dùng" />
                <p style={{ fontSize: "1rem" }}>
                  "Tôi rất thích cách dễ dàng để nộp bài và nhận phản hồi từ các dự án Lab!"
                </p>
                <p>
                  <strong>- Nguyễn Đức Cường (K16_UTC), Sinh viên</strong>
                </p>
              </Testimonial>
            </Col>
            <Col md="4">
              <Testimonial color="green">
                <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="Người dùng" />
                <p style={{ fontSize: "1rem" }}>"Hệ thống dễ sử dụng và rất tiện lợi cho việc quản lý dự án Lab."</p>
                <p>
                  <strong>- Hoàng Tuấn Minh (K17_UTC), Sinh viên</strong>
                </p>
              </Testimonial>
            </Col>
          </Row>
        </Block>
      </Content>

      <BackToTopButton onClick={scrollToTop} visible={isVisible}>
        ↑
      </BackToTopButton>
      <FooterContainer>
        <FooterRow>
          <FooterColumn>
            <h4>Về Chúng Tôi</h4>
            <p>
              Nền tảng của chúng tôi cam kết cải thiện hiệu quả và chất lượng trong việc đánh giá các dự án lab. Chúng
              tôi nỗ lực cung cấp dịch vụ tốt nhất cho cả sinh viên và giảng viên.
            </p>
          </FooterColumn>

          <FooterColumn>
            <h4>Liên Hệ Với Chúng Tôi</h4>
            <p>Email: support@evaluationsystem.com</p>
            <p>Điện thoại: 024 7300 1866</p>
            <p>
              Địa chỉ: 3 Đ. Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội
            </p>
          </FooterColumn>

          <FooterColumn>
            <h4>Đăng Ký Nhận Bản Tin</h4>
            <EmailForm>
              <input type="email" placeholder="Nhập email của bạn" required />
              <button type="submit">Đăng Ký</button>
            </EmailForm>
          </FooterColumn>

          <FooterColumn>
            <h4>Theo Dõi Chúng Tôi</h4>
            <SocialIcons>
              <a href="#">
                <FaFacebook />
              </a>
              <a href="#">
                <FaTwitter />
              </a>
              <a href="#">
                <FaGoogle />
              </a>
              <a href="#">
                <FaLinkedin />
              </a>
            </SocialIcons>
          </FooterColumn>
        </FooterRow>

        <FooterBottom>
          <p>&copy; 2024 Hệ Thống Đánh Giá Môn Học. Bảo lưu mọi quyền.</p>
        </FooterBottom>
      </FooterContainer>
    </>
  );
};

export default LandingPage;
