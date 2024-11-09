import React from 'react';

const freeData =[
    "100 daily credits - invite members to earn more",
    "1Up to 5 members per workspace",
    "Unlimited assistants and prompt templates",
    "Meeting integrations with Google Meet, Microsoft Teams, and Zoom",
    "Knowledge integrations with Google Drive, SharePoint, OneDrive, Notion, and Confluence",
    "Help center support",
]
const teamData =[
    "Everything in Free",
    "1Up to 5 members per workspace",
    "Unlimited assistants and prompt templates",
    "Meeting integrations with Google Meet, Microsoft Teams, and Zoom",
    "Knowledge integrations with Google Drive, SharePoint, OneDrive, Notion, and Confluence",
    "Help center support",
]
const enterpriseData =[
    "100 daily credits - invite members to earn more",
    "1Up to 5 members per workspace",
    "Unlimited assistants and prompt templates",
    "Meeting integrations with Google Meet, Microsoft Teams, and Zoom",
    "Knowledge integrations with Google Drive, SharePoint, OneDrive, Notion, and Confluence",
    "Help center support",
]

const PricingPlans = () => {
    return (
        <div className="bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col justify-center items-center mb-6">
                    <h2 className="text-2xl font-bold my-3">Upgrade your workspace for unlimited value</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span>Choose Your Plan</span>
                        <div className="w-8 h-4 bg-green-500 rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Plan */}
                    <div className="">
                        <div className='rounded-2xl p-6 border border-gray-800 mb-4'>
                            <div className="mb-3">
                                <h3 className="text-xl mb-1">Free</h3>
                                <p className="text-sm text-gray-400">Your current plan</p>
                            </div>
                            <button className="w-full py-2 px-4 rounded-lg border border-gray-700 mb-0 text-dark">
                                Continue using Free
                            </button>
                        </div>
                        <ul className="space-y-4">
                            {freeData.map((item, index) =>(
                                <li className="flex items-start gap-2" key={index}>
                                    <i className="w-5 h-5 text-white mt-0.5 bi bi-check2"></i>
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Team Plan */}
                    <div className="">
                        <div className='rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-400 mb-4'>
                            <div className="mb-3">
                                <h3 className="text-xl mb-1">Team €35/month</h3>
                                <p className="text-sm opacity-80">Pay monthly/billed annually</p>
                            </div>

                            <button className="w-full py-2 px-4 rounded-lg bg-white text-blue-600 font-medium mb-0">
                                Select team
                            </button>
                        </div>
                        <ul className="space-y-4">
                            {teamData.map((item, index) =>(
                                <li className="flex items-start gap-2" key={index}>
                                    <i className="w-5 h-5 text-white mt-0.5 bi bi-check2"></i>
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="">
                        <div className='rounded-2xl p-6 bg-gradient-to-br from-red-500 via-red-400 to-pink-500 mb-4'>
                            <div className="mb-3">
                                <h3 className="text-xl mb-1">Enterprise Custom pricing</h3>
                                <p className="text-sm opacity-80">Custom terms</p>
                            </div>

                            <button className="w-full py-2 px-4 rounded-lg bg-white text-red-600 font-medium mb-0">
                                Schedule a meeting
                            </button>
                        </div>
                        <ul className="space-y-4">
                            {enterpriseData.map((item,index) =>(
                                <li className="flex items-start gap-2" key={index}>
                                    <i className="w-5 h-5 text-white mt-0.5 bi bi-check2"></i>
                                    <span className="text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-gray-500 text-sm text-center mt-8">
                    ISO 27001 certified and GDPR compliant. Data encrypted at rest with AES-256 and in transit with TLS 1.2
                </p>
            </div>
        </div>
    );
};

export default PricingPlans;