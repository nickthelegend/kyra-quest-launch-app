"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, QrCode, Download, Copy, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import QRCode from "qrcode"

interface QRCodeModalProps {
    isOpen: boolean
    onClose: () => void
    questAddress: string
    questName: string
}

export function QRCodeModal({
    isOpen,
    onClose,
    questAddress,
    questName
}: QRCodeModalProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("")
    const [copied, setCopied] = useState(false)

    // Generate QR code data
    const qrData = `kyra:${questAddress}`

    useEffect(() => {
        if (isOpen) {
            QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff"
                }
            }).then(setQrDataUrl).catch(console.error)
        }
    }, [isOpen, qrData])

    const handleDownload = () => {
        if (!qrDataUrl) return

        const link = document.createElement("a")
        link.download = `${questName.replace(/\s+/g, "-").toLowerCase()}-qr.png`
        link.href = qrDataUrl
        link.click()
        toast.success("QR Code downloaded!")
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(qrData)
        setCopied(true)
        toast.success("QR data copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <Card className="p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <QrCode className="w-6 h-6 text-violet-400" />
                                <h3 className="text-xl font-bold text-white">Quest QR Code</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-gray-400 mb-4">{questName}</p>

                            {/* QR Code */}
                            <div className="inline-block p-4 bg-white rounded-2xl">
                                {qrDataUrl ? (
                                    <img src={qrDataUrl} alt="Quest QR Code" className="w-64 h-64" />
                                ) : (
                                    <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-xl" />
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mt-4 font-mono break-all">
                                {qrData}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleCopy}
                                variant="outline"
                                className="flex-1 bg-transparent border-white/10"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Data
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleDownload}
                                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Print this QR code and display it at your location. Players scan it to verify and claim rewards.
                        </p>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
