'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from 'components/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Create a FormData object instead of JSON
        const formDataObj = new FormData();
        formDataObj.append('username', formData.name);
        formDataObj.append('email', formData.email);
        formDataObj.append('password', formData.password);

        // Make API call with FormData
        const response = await fetch('http://localhost:8000/api/users/', {
          method: 'POST',
          body: formDataObj, // Using FormData instead of JSON.stringify
        });        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const responseData = await response.json();

        // Automatically log in the user after successful registration
        if (responseData.token) {
          await Promise.resolve(login(responseData.token));

          // Add a small delay before redirecting
          setTimeout(() => {
            router.push('/');
          }, 100);
        } else {
          // If no token is returned, try to log in with the registered credentials
          try {
            const loginResponse = await fetch('http://localhost:8000/api/users/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                'email': formData.email,
                'password': formData.password,
              }),
            });

            if (loginResponse.ok) {
              const loginData = await loginResponse.json();
              await Promise.resolve(login(loginData.token));

              setTimeout(() => {
                router.push('/');
              }, 100);
            } else {
              // Show success message without auto-login
              setSuccess(true);
            }
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            setSuccess(true);
          }
        }

        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Registration failed:', error);
        setErrors({
          form: error instanceof Error ? error.message : 'Registration failed. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative dark:bg-green-900 dark:border-green-800 dark:text-green-200" role="alert">
            <p className="font-medium">Registration successful!</p>
            <p className="text-sm">Please check your email to verify your account.</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border
                    ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-500 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'}
                    rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border
                    ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-500 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border
                    ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-500 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'}
                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border
                    ${errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300 placeholder-gray-500 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'}
                    rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-800 dark:text-red-200" role="alert">
                <p>{errors.form}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
