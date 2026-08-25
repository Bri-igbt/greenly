"use client";

import AddressCard from "@/app/components/AddressCard";
import AddressForm from "@/app/components/AddressForm";
import Loading from "@/app/components/Loading";
import { useAuth } from "@/app/context/AuthContext";
import type { Address } from "@/app/types";
import api from "@/config/api";
import { MapPinIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
    const { updateUser } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        label: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        isDefault: false,
    });

    const resetForm = () => {
        setForm({
            label: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            isDefault: false,
        });

        setShowForm(false);
        setEditingId(null);
    };

    const getLocation = (): Promise<{lat: number; lng: number;}> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(
                    new Error(
                        "Geolocation is not supported by this browser."
                    )
                );
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error(
                        "Geolocation error:",
                        {
                            code: error.code,
                            message: error.message,
                        }
                    );

                    reject(error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000,
                }
            );
        });
    };

    // Submit address
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            let coords: {
                lat: number;
                lng: number;
            } | null = null;

            try {
                coords = await getLocation();
            } catch (locationError) {
                console.warn(
                    "Location unavailable:",
                    locationError
                );

                toast(
                    "Location unavailable. Address will be saved without GPS coordinates."
                );
            }

            const payload = {
                ...form,

                ...(coords && {
                    lat: coords.lat,
                    lng: coords.lng,
                }),
            };

            if (editingId) {
                const { data } = await api.put(
                    `/addresses/${editingId}`,
                    payload
                );

                setAddresses(data.addresses);

                updateUser({
                    addresses: data.addresses,
                });

                toast.success(
                    "Address updated successfully"
                );
            } else {
                const { data } = await api.post(
                    "/addresses",
                    payload
                );

                setAddresses(data.addresses);

                updateUser({
                    addresses: data.addresses,
                });

                toast.success(
                    "Address added successfully"
                );
            }

            resetForm();
        } catch (error: any) {
            console.error(
                "Address submit error:",
                error
            );

            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Failed to save address"
            );
        }
    };

    // Edit address
    const onEditHandler = (addr: Address) => {
        setForm({
            label: addr.label,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            isDefault: addr.isDefault,
        });

        setEditingId(addr.id);
        setShowForm(true);
    };

    // Fetch addresses
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setLoading(true);

                // IMPORTANT: plural "addresses"
                const { data } = await api.get("/addresses");

                setAddresses(data.addresses || []);

                updateUser({
                    addresses: data.addresses || [],
                });
            } catch (error: any) {
                console.error(
                    "Fetch addresses error:",
                    error
                );

                toast.error(
                    error?.response?.data?.message ||
                        error?.message ||
                        "Failed to load addresses"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    return (
        <div className="min-h-screen bg-app-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-app-green">
                        My Addresses
                    </h1>

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-app-green text-white text-sm font-semibold rounded-xl hover:bg-app-green-light transition-colors flex items-center gap-2"
                    >
                        <PlusIcon className="size-4" />
                        Add Address
                    </button>
                </div>

                {/* Address Form */}
                {showForm && (
                    <AddressForm
                        resetForm={resetForm}
                        handleSubmit={handleSubmit}
                        form={form}
                        setForm={setForm}
                        editingId={editingId}
                    />
                )}

                {/* Address List */}
                {loading ? (
                    <Loading />
                ) : addresses.length === 0 ? (
                    <div className="text-center py-16">
                        <MapPinIcon className="size-16 text-app-border mx-auto mb-4" />

                        <h2 className="text-lg font-semibold text-app-green mb-2">
                            No addresses saved
                        </h2>

                        <p className="text-sm text-app-text-light">
                            Add an address for faster checkout
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <AddressCard
                                key={addr.id}
                                addr={addr}
                                onEditHandler={onEditHandler}
                                setAddresses={setAddresses}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;