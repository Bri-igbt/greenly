"use client"

import { heroSectionData } from "@/assets/assets";
import { BikeIcon, MailIcon, User, Eye, EyeOff, Lock, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react"

const page = () => {
    const [isLoginState, setIsLoginState] = useState(true)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => window.location.href = "/", 1000)
    } 

    return (
        <div className="min-h-screen flex">
            {/* left side  */}
            <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
                <Image
                    src={heroSectionData.hero_image}
                    alt="Hero Image"
                    className="absolute inset-0 object-cover h-full bg-center opacity-10"
                />

                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-semibold text-white mb-4">Welcome back to Greenly</h2>
                    <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">
                        Fresh groceries and organic produce, delivered to your doorstep.
                    </p>
                </div>
            </div>

            {/* Right side  */}
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md">
                    {/* form header message */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <BikeIcon className="size-8 text-app-green" />
                            <span className="text-2xl font-semibold text-app-green">Greenly</span>
                        </Link>

                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            {isLoginState ? "Sign in to your account" : "Create an account"}
                        </h1>

                        <p className="text-sm text-app-text-light ">
                            {isLoginState ? "Don't have an account" : "Already have an account?"}
                            <button 
                                onClick={()=> setIsLoginState(!isLoginState)}
                                className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-colors"
                            >
                                {isLoginState ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {/* login / register form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLoginState && (
                            <label htmlFor="" className="text-sm flex flex-col gap-1">
                                Name
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                    <input 
                                        type="text"
                                        value={name}
                                        onChange={(e)=> setName(e.target.value)}
                                        required
                                        placeholder="Your name"
                                        className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border focus:border-app-border transition-all"
                                    />
                                </div>
                            </label>
                        )}

                        <label htmlFor="" className="text-sm flex flex-col gap-1">
                            Email
                            <div className="relative">
                                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e)=> setEmail(e.target.value)}
                                    required
                                    placeholder="Email address"
                                    className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border focus:border-app-border transition-all"
                                />
                            </div>
                        </label>

                        <label className="text-sm flex flex-col gap-1">
                            Password
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="********"
                                    className="w-full pl-11 pr-11 py-3 text-sm bg-white rounded-xl border focus:border-app-border transition-all"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-app-text-light hover:text-app-text"
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                        </label>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="flex-center w-full py-3 bg-green-950 text-white font-semibold rounded-xl hover:bg-green-900 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2Icon className="animate-spin"/> : isLoginState ? "Sign In" : "Sign Up"}
                        </button>
                    </form>
                    <div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default page