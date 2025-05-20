"use client";
import factoryCampaign from "@/lib/abi/FactoryCampaign.json";
import campaignManager from "@/lib/abi/CampaignManager.json";
import Blog from "@/lib/abi/Blog.json";

const contracts = {
  37111: {
    blog: {
      address: "0x9cDD8990B7a9276541246227dbA49eD0234eE6b4",
      abi: Blog,
    },
    factoryCampaign: {
      address: "0x0720ED0479a6B235ECAb2C3F38334198ADACce92",
      abi: factoryCampaign,
    },
    campaignManager: {
      address: "0x941cBEe128011F49901A57A939589ADa93d26F7C",
      abi: campaignManager,
    },
  },
  232: {
    blog: {
      address: "0x9cDD8990B7a9276541246227dbA49eD0234eE6b4",
      abi: Blog,
    },
    factoryCampaign: {
      address: "0x0720ED0479a6B235ECAb2C3F38334198ADACce92",
      abi: factoryCampaign,
    },
    campaignManager: {
      address: "0x941cBEe128011F49901A57A939589ADa93d26F7C",
      abi: campaignManager,
    },
  },
};

export default contracts;
