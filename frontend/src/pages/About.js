import React from 'react';
import * as Icons from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Icons.Shield,
      title: "Chính Hãng 100%",
      description: "Cam kết cung cấp sản phẩm chính hãng với tem bảo hành đầy đủ"
    },
    {
      icon: Icons.Truck,
      title: "Giao Hàng Nhanh",
      description: "Giao hàng nhanh chóng trong 1-2 ngày làm việc tại TP.HCM"
    },
    {
      icon: Icons.Clock,
      title: "Hỗ Trợ 24/7",
      description: "Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ mọi lúc"
    },
    {
      icon: Icons.RotateCcw,
      title: "Đổi Trả Linh Hoạt",
      description: "Chính sách đổi trả trong 30 ngày, không điều kiện"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Khách hàng tin tưởng" },
    { number: "5,000+", label: "Sản phẩm đa dạng" },
    { number: "99%", label: "Khách hàng hài lòng" },
    { number: "24/7", label: "Hỗ trợ khách hàng" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-3xl font-bold">J</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Jimm9-Shop</h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Cửa hàng công nghệ hàng đầu Việt Nam - Nơi công nghệ kết nối cuộc sống
            </p>
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu Chuyện Của Chúng Tôi</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Jimm9-Shop ra đời từ niềm đam mê công nghệ và mong muốn mang đến những sản phẩm 
              công nghệ tốt nhất cho người tiêu dùng Việt Nam. Chúng tôi hiểu rằng công nghệ 
              không chỉ là những thiết bị, mà là cầu nối giúp con người kết nối và phát triển.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Với đội ngũ chuyên gia am hiểu sâu về công nghệ, chúng tôi tuyển chọn kỹ lưỡng 
              từng sản phẩm để đảm bảo chất lượng và giá trị tốt nhất cho khách hàng.
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full flex items-center justify-center mr-4">
                <Icons.Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sự hài lòng của khách hàng</p>
                <p className="text-gray-600">là động lực phát triển của chúng tôi</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Tại Sao Chọn Jimm9-Shop?</h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Jimm9-Shop Trong Số Liệu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6">
              <Icons.Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh</h3>
            <p className="text-gray-700 leading-relaxed">
              Mang đến những sản phẩm công nghệ chất lượng cao với giá cả hợp lý, 
              đồng thời cung cấp dịch vụ khách hàng xuất sắc để tạo nên trải nghiệm 
              mua sắm tuyệt vời nhất.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <Icons.Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tầm Nhìn</h3>
            <p className="text-gray-700 leading-relaxed">
              Trở thành nền tảng mua sắm công nghệ đáng tin cậy số 1 tại Việt Nam, 
              nơi mọi người có thể dễ dàng tiếp cận và sở hữu những công nghệ tiên tiến nhất.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Bạn Có Câu Hỏi?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn 
            tìm được sản phẩm công nghệ phù hợp nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:19001234" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <Icons.Phone className="w-5 h-5 mr-2" />
              Gọi Ngay: 1900 1234
            </a>
            <a 
              href="mailto:support@jimm9shop.vn" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
            >
              <Icons.Mail className="w-5 h-5 mr-2" />
              Email: support@jimm9shop.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;