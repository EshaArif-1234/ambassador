'use client';

const SignupBanner = () => {
  return (
    <div className="bg-[#E36630] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Ambassador Kitchen Equipment
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Create an account or sign in to access exclusive pricing, bulk orders, and professional support
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <a
              href="/signup"
              className="flex-1 px-6 py-3 bg-[#0F4C69] text-white font-semibold rounded-lg hover:bg-[#cc5a2a] transition-colors text-center"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="flex-1 px-6 py-3 bg-transparent border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white hover:text-[#0F4C69] transition-colors text-center"
            >
              Login
            </a>
          </div>
          
          <p className="mt-6 text-white/60 text-sm">
            Join thousands of restaurants and hotels using Ambassador equipment
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupBanner;