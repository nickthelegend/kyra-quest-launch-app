const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ODY4OTRiYS02NjU1LTRhNzItYTIyMC1lODVmZWVlZWM1ODgiLCJlbWFpbCI6Im5pY2t0aGVsZWdlbmQ2OTY5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5OGIyNWIyZTEwNTJmY2E1MDk0ZiIsInNjb3BlZEtleVNlY3JldCI6IjlkOTVhZDExMDVjOTZjMDY4ZmU1NTEwNzY0ZTc4YTFmYjY2MmJjN2EwODA2NDUxNmIzNjdjZDFhMjQ5YTgyOWQiLCJleHAiOjE3OTk4NDA2MDZ9.HFcgGhk6tz3areqNW5Vz90TRXHyAx7V87ZdPxfx6TA0"

export async function uploadToPinata(file: File) {
    try {
        const formData = new FormData()
        formData.append("file", file)

        const metadata = JSON.stringify({
            name: `KyraQuest-${Date.now()}`,
        })
        formData.append("pinataMetadata", metadata)

        const options = JSON.stringify({
            cidVersion: 0,
        })
        formData.append("pinataOptions", options)

        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: formData,
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || "Failed to upload to Pinata")
        }

        const data = await res.json()
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    } catch (error) {
        console.error("Error uploading to Pinata:", error)
        throw error
    }
}
