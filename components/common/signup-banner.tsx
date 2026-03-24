'use client';

const SignupBanner = () => {
  return (
    <div className="bg-orange-500 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Ambassador Kitchen Equipment
          </h2>
          <p className="text-lg text-white mb-8 opacity-90">
            Create an account or sign in to access exclusive pricing, bulk orders, and professional support
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <a
              href="/signup"
              className="flex-1 px-6 py-3 bg-white text-orange-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="flex-1 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-500 transition-colors text-center"
            >
              Login
            </a>
          </div>
          
          <p className="mt-6 text-white text-sm opacity-75">
            Join thousands of restaurants and hotels using Ambassador equipment
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupBanner;