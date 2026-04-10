import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F7DDE2]">
      {/* Header */}
      <div className="bg-[#0F4C45] text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <i className="fas fa-crown text-[#FBEFF2] text-xl"></i>
            <h1 className="text-xl font-bold">
              Nail<span className="text-[#FBEFF2]">Atelier</span> Admin
            </h1>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#000000] mb-2">Dashboard</h2>
          <p className="text-[#000000]/60">
            Welcome back! Manage your content from here.
          </p>
        </div>

        {/* 4 Cards Grid - Each redirects to a separate page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Edit Gallery Card */}
          <Link href="/admin/editGallery" className="block">
            <div className="bg-[#FBEFF2] rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
              <div className="p-6">
                <div className="w-16 h-16 bg-[#0F4C45]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0F4C45]/20 transition">
                  <i className="fas fa-images text-3xl text-[#0F4C45]"></i>
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2">
                  Edit Gallery
                </h3>
                <p className="text-[#000000]/60 text-sm">
                  Manage and organize your nail gallery images
                </p>
              </div>
              <div className="bg-[#1A5C52] px-6 py-3 text-white text-sm font-semibold group-hover:bg-[#0A1F1D] transition">
                Manage Gallery →
              </div>
            </div>
          </Link>

          {/* Edit Video Review Card */}
          <Link href="/admin/editvideoreview" className="block">
            <div className="bg-[#FBEFF2] rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
              <div className="p-6">
                <div className="w-16 h-16 bg-[#0F4C45]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0F4C45]/20 transition">
                  <i className="fas fa-video text-3xl text-[#0F4C45]"></i>
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2">
                  Edit Video Review
                </h3>
                <p className="text-[#000000]/60 text-sm">
                  Manage client video testimonials
                </p>
              </div>
              <div className="bg-[#1A5C52] px-6 py-3 text-white text-sm font-semibold group-hover:bg-[#0A1F1D] transition">
                Manage Reviews →
              </div>
            </div>
          </Link>

          {/* Register Card */}
          <Link href="/admin/register" className="block">
            <div className="bg-[#FBEFF2] rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
              <div className="p-6">
                <div className="w-16 h-16 bg-[#0F4C45]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0F4C45]/20 transition">
                  <i className="fas fa-user-plus text-3xl text-[#0F4C45]"></i>
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2">
                  Register
                </h3>
                <p className="text-[#000000]/60 text-sm">
                  Create new admin accounts
                </p>
              </div>
              <div className="bg-[#1A5C52] px-6 py-3 text-white text-sm font-semibold group-hover:bg-[#0A1F1D] transition">
                Register Now →
              </div>
            </div>
          </Link>

          {/* Upload Services Card */}
          <Link href="/admin/uploadservices" className="block">
            <div className="bg-[#FBEFF2] rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group">
              <div className="p-6">
                <div className="w-16 h-16 bg-[#0F4C45]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0F4C45]/20 transition">
                  <i className="fas fa-cloud-upload-alt text-3xl text-[#0F4C45]"></i>
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2">
                  Upload Services
                </h3>
                <p className="text-[#000000]/60 text-sm">
                  Manage service packages and pricing
                </p>
              </div>
              <div className="bg-[#1A5C52] px-6 py-3 text-white text-sm font-semibold group-hover:bg-[#0A1F1D] transition">
                Upload Now →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 rounded-xl p-5 border border-[#FBEFF2]">
            <div className="flex items-center gap-3">
              <i className="fas fa-images text-2xl text-[#0F4C45]"></i>
              <div>
                <p className="text-sm text-[#000000]/60">Gallery Items</p>
                <p className="text-2xl font-bold text-[#0F4C45]">128</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-5 border border-[#FBEFF2]">
            <div className="flex items-center gap-3">
              <i className="fas fa-video text-2xl text-[#0F4C45]"></i>
              <div>
                <p className="text-sm text-[#000000]/60">Video Reviews</p>
                <p className="text-2xl font-bold text-[#0F4C45]">34</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-5 border border-[#FBEFF2]">
            <div className="flex items-center gap-3">
              <i className="fas fa-users text-2xl text-[#0F4C45]"></i>
              <div>
                <p className="text-sm text-[#000000]/60">Team Members</p>
                <p className="text-2xl font-bold text-[#0F4C45]">9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}