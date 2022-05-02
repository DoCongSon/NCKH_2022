import "./App.css";
import Student from "./page/Student";
// import { BrowserRouter as Router} from "react-router-dom";
import { Layout, Image } from "antd";
import { Footer, Header } from "antd/lib/layout/layout";
// import { Link } from "react-router-dom";
import Text from "antd/lib/typography/Text";

function App() {
  return (
      <Layout className="layout">
        <Header className="header">
          <div className="logo">
            <Image
              width={120}
              height={60}
              preview={false}
              src="https://i.postimg.cc/J7Ygvwq6/White-Illustrated-Male-Student-Logo-500-250-px-1.png"
            />
          </div>
        </Header>
        <Student />
        <Footer style={{ textAlign: "center" }}>
          <Text>Khoa Điện tử - Viễn thông</Text>
          <br />
          <Text>Học viện Kĩ thuật mật mã © 2022</Text>
        </Footer>
      </Layout>
  );
}

export default App;
