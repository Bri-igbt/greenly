import { footerData } from "@/assets/assets"
import { BikeIcon } from "lucide-react"
import Link from "next/link"

const Footer = () => {
    return (
        <footer className='bg-app-green text-white'>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <Link href='/' className="flex items-center gap-2 mb-4">
                            <BikeIcon className="size-6 text-white" />
                            <span className="text-xl font-semibold">{footerData.brand.name}</span>
                        </Link>

                        <p className="text-sm text-white/70 mb-4">
                            {footerData.brand.description}
                        </p>

                        <div className="flex gap-3">
                            {footerData.brand.socials.map((social, i) => (
                                <a  key={i} href={social.link} className="size-9 rounded-lg bg-white/10 flex-center hover:bg-white/2">
                                    <social.icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {footerData.sections.map((social, i) => (
                        <div key={i}>
                            <h3 className="text-sm font-semibold uppercase mb-4">{social.title}</h3>
                            <ul className="space-y-2.5">
                                {social.links.map((link, i) => (
                                    <li key={i}>
                                        {link.href ? (
                                            <Link  
                                                href={link.href}
                                                className="text-sm text-white/70 hover:text-white"
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a href={link.href} className="text-sm text-white/70 hover:text-white">

                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                </div>

                <div>

                </div>
            </div>
        </footer>
    )
}

export default Footer