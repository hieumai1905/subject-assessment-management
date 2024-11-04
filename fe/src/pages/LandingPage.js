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
      <Head title="Homepage" />
      <Content>
        <BlockHead size="sm" className="p-4 rounded animate__animated animate__fadeInDown">
          <BlockBetween>
            <BlockHeadContent>
              <Title page tag="h2" className="text-dark" style={{ fontSize: "2rem" }}>
                Lab Project Evaluation and Grading System
              </Title>
              <BlockDes>
                <p className="text-dark" style={{ fontSize: "1.2rem" }}>
                  Welcome to SWP Evaluation System
                </p>
              </BlockDes>
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {/* Introduction Section */}
        <Block className="mt-5 animate__animated animate__fadeInUp text-center">
          <ImageContainer
            img="https://fpt.edu.vn/Resources/brand/uploads/Banner2.jpg"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Block>

        {/* Features Section */}
        <Block className="mt-5 animate__animated animate__fadeInUp">
          <BlockHeadContent className="text-center mb-4">
            <Title tag="h4" style={{ fontSize: "1.5rem" }}>
              Features
            </Title>
            <BlockDes>
              <p style={{ fontSize: "1.2rem" }}>Discover the key features of our platform:</p>
            </BlockDes>
          </BlockHeadContent>
          <Row className="g-gs text-center">
            <Col md="3">
              <FeatureCard>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRAXFPBNQyXTlEfNf8vVgJi2j0EKtuv0tYWQ&s"
                  alt="Automated Grading"
                />
                <h5>Automated Grading</h5>
                <p>
                  Save time with our automated grading system, ensuring quick and accurate results s for improvement.
                </p>
                
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img src="https://cdn-icons-png.freepik.com/512/8437/8437070.png" alt="Detailed Feedback" />
                <h5>Detailed Feedback</h5>
                <p>Receive detailed feedback to help you understand your strengths and areas for improvement.</p>
                
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img src="https://cdn-icons-png.flaticon.com/512/463/463662.png" alt="Secure and Reliable" />
                <h5>Secure and Reliable</h5>
                <p>
                  Your data is protected with the highest security standards to ensure privacy and reliability for
                  improvement.
                </p>
                
              </FeatureCard>
            </Col>
            <Col md="3">
              <FeatureCard>
                <img
                  src="https://www.pngitem.com/pimgs/m/621-6210821_rr-icon-recovery-new-tektronix-logo-hd-png.png"
                  alt="Easy to use"
                />
                <h5>Easy to use</h5>
                <p>
                  Interface is friendly, with the highest security standards easy for user to use and interact with
                  system!
                </p>
                
              </FeatureCard>
            </Col>
          </Row>
        </Block>

        {/* Testimonials Section */}
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
              Testimonials
            </Title>
            <BlockDes>
              <p style={{ fontSize: "1.2rem" }}>What our users are saying:</p>
            </BlockDes>
          </BlockHeadContent>
          <Row className="g-gs">
            <Col md="4">
              <Testimonial color="#FF6347">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                <p style={{ fontSize: "1rem" }}>
                  "The grading system has significantly improved our workflow and saved us a lot of time."
                </p>
                <p>
                  <strong>- Vũ Minh Long (GV_FPTU), Instructor</strong>
                </p>
              </Testimonial>
            </Col>
            <Col md="4">
              <Testimonial color="#4682B4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                <p style={{ fontSize: "1rem" }}>
                  "I love how easy it is to submit and receive feedback on my lab projects!"
                </p>
                <p>
                  <strong>- Nguyễn Đức Cường (K16_HL), Student</strong>
                </p>
              </Testimonial>
            </Col>
            <Col md="4">
              <Testimonial color="green">
                <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="User" />
                <p style={{ fontSize: "1rem" }}>
                  "I love how easy it is to submit and receive feedback on my lab projects."
                </p>
                <p>
                  <strong>- Hoàng Tuấn Minh (k17_HCM), Student</strong>
                </p>
              </Testimonial>
            </Col>
          </Row>
        </Block>

        {/* Partners Section */}
        {/* <Block className="mt-5 animate__animated animate__fadeInUp">
          <BlockHeadContent className="text-center mb-5">
            <Title tag="h4" style={{ fontSize: "1.5rem" }}>
              Our Partners
            </Title>
            <BlockDes>
              <p style={{ fontSize: "1.2rem" }}>We collaborate with leading cloud providers:</p>
            </BlockDes>
          </BlockHeadContent>
          <Row className="g-gs text-center">
            <Col md="2">
              <PartnerImage img="https://finance.vietstock.vn/image/VPB" alt="Partner 1" />
            </Col>
            <Col md="2">
              <PartnerImage
                img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-9Qh2rJaKcHthgCzbqkeZ2GWJJmcT2M4oXA&s"
                alt="Partner 2"
              />
            </Col>
            <Col md="2">
              <PartnerImage
                img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLAlXVjRTlfdQ6oxkluC8JDvGJfyFzn-sOpg&s"
                alt="Partner 3"
              />
            </Col>
            <Col md="2">
              <PartnerImage
                img="https://casso.vn/wp-content/uploads/2023/07/Logo-TCB-H-1024x341.webp"
                alt="Partner 4"
              />
            </Col>
            <Col md="2">
              <PartnerImage
                img="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqOIRHEJ2IGM3hdNBUE2C4_9izZ3Dds-HGKQ&s"
                alt="Partner 5"
              />
            </Col>
            <Col md="2">
              <PartnerImage img="https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_MB_new.png" alt="Partner 6" />
            </Col>
          </Row>
        </Block> */}
      </Content>
      <BackToTopButton onClick={scrollToTop} visible={isVisible}>
        ↑
      </BackToTopButton>
      <FooterContainer>
        <FooterRow>
          <FooterColumn>
            <h4>About Us</h4>
            <p>
              Our platform is dedicated to improving the efficiency and quality of lab project evaluations. We strive to
              provide the best service for students and instructors alike.
            </p>
          </FooterColumn>

          <FooterColumn>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Features</a>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Support</a>
              </li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h4>Contact Us</h4>
            <p>Email: support@swpevaluationsystem.com</p>
            <p>Phone: 024 7300 1866</p>
            <p>
              Address: Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc – Km29 Đại lộ Thăng Long, H. Thạch Thất, TP.
              Hà Nội
            </p>
          </FooterColumn>

          <FooterColumn>
            <h4>Subscribe to our Newsletter</h4>
            <EmailForm>
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </EmailForm>
          </FooterColumn>

          <FooterColumn>
            <h4>Follow Us</h4>
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
          <p>&copy; 2024 SWP Evaluation System. All rights reserved.</p>
        </FooterBottom>
      </FooterContainer>
    </>
  );
};

export default LandingPage;
