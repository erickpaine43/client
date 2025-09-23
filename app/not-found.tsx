import { LandingLayout } from "@/components/landing/LandingLayout";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  return (
    <LandingLayout>
      <div
        className="min-h-screen flex flex-col items-center justify-center text-primary-800 gradient-bg"
      >
        <div className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-lg">
          <Image
            src="/img/pengo_48X48.png"
            alt="Product Logo"
            width={100}
            height={100}
            className="mb-6 bounce-animation"
          />
          <h1 className="text-6xl font-extrabold text-primary-600 mb-4">404</h1>
          <p className="text-2xl text-primary-700 mb-6">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <p className="text-lg text-primary-600 mb-8">
            You tried to enter an incorrect route. Please check if there is a
            typo, or try one of these common routes:
            <ul className="mt-2 list-none">
              <li>
                <Link
                  href="/"
                  className="text-primary-600 underline hover:no-underline"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-primary-600 underline hover:no-underline"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-primary-600 underline hover:no-underline"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
            or
          </p>
          <Link
            href="https://penguinmails.com/"
            className="px-6 py-3 font-semibold rounded-md transition-colors duration-300 ease-in-out"
          >
            Go back home
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
};
export default NotFound;
