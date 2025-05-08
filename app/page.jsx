"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@components/Header/index.jsx";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import NoiseBg from "@/components/NoiseBg";
import DecryptedText from "@/components/DecryptedText";
import { motion } from "framer-motion";
import Waves from "@/components/Waves";
import MetaBalls from "@/components/MetaBalls";
import Particles from "@/components/Particles";
import OrbWithTextTrail from "@/components/Orbs";
import HowItWorksBlocks from "./components/HowItWorksBlocks.jsx";
import "./page.css";

export default function Home() {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Custom easing curve for fluid animation
      },
    },
  };

  return (
    <>
      <Header
        LogoComponent={<Logo href="/apps" />}
        menuItems={
          [
            // { label: "Home", href: "/" },
            // { label: "Campaigns", href: "/apps" },
            // { label: "Documentation", href: "/docs" },
            // { label: "About", href: "/about" }
          ]
        }
        rightItems={[
          <Link key="create" href="/apps/create">
            <Button
              variant="outline"
              className="mr-2 rounded-full border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>,
          <Link key="apps" href="/apps">
            <Button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-720 hover:to-cyan-720 border-0 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              Explore Apps
            </Button>
          </Link>,
        ]}
        glassMorphism={true}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black"></div>
        <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-cyan-500/20 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[25vw] h-[25vw] bg-emerald-500/20 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {/* Hero Section */}
      {/* <section className="h-[80vh] relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"> */}
      <section className="h-[100vh] flex flex-row justify-end items-center overflow-hidden">
        <div className="container px-4 sm:px-6">
          <motion.div
            className="min-h-[400px] w-full block"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <DecryptedText
                text="WRITE."
                speed={100}
                maxIterations={20}
                characters="z!?<>:@'+]{]|*^%$#@!~`"
                className="revealed font-extrabold text-9xl text-transparent text-white opacity-80 hover:opacity-30 duration-300"
                parentClassName="font-extrabold text-9xl text-transparent text-white"
                encryptedClassName="encrypted"
                animateOn="view"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DecryptedText
                text="CONTRIBUTE."
                speed={100}
                maxIterations={25}
                characters="&918KL\\;MS)XK0981!?"
                className="revealed font-extrabold text-9xl text-transparent text-white opacity-80 hover:opacity-30 duration-300"
                parentClassName="font-extrabold text-9xl text-transparent text-white "
                encryptedClassName="encrypted"
                animateOn="view"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DecryptedText
                text="EARN."
                speed={100}
                maxIterations={30}
                characters="20klkcas09128[\\!/?xsasd902,,<>"
                className="revealed font-extrabold text-9xl text-transparent text-white "
                parentClassName="font-extrabold text-9xl text-transparent text-white "
                encryptedClassName="encrypted"
                animateOn="view"
              />
            </motion.div>
          </motion.div>
          <NoiseBg
            patternSize={250}
            patternScaleX={1}
            patternScaleY={1}
            patternRefreshInterval={2}
            patternAlpha={15}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 relative">
        <div className="grids absolute top-[25%] z-[-1] inset-0">
          <div className="grids-fade"></div>
          <div className="grids-lines"></div>
        </div>
        <div className="container px-4 sm:px-6">
          <motion.div
            className="text-center mb-24 pt-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-4xl leading-relaxed text-white text-center mx-auto">
              Connects content creators with campaigns, rewarding quality
              writing with cryptocurrency rewards.
            </p>
          </motion.div>

          <div className="flex justify-between w-full max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.2,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <HowItWorksBlocks
                  text="Join Campaigns"
                  className="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-400 group backdrop-blur-sm"
                  children={
                    <div className="absolute inset-0 z-0">
                      <Waves
                        lineColor="#10b981"
                        backgroundColor="rgba(0, 0, 0, 0)"
                        waveSpeedX={0.02}
                        waveSpeedY={0.04}
                        waveAmpX={50}
                        waveAmpY={10}
                        friction={0.9}
                        tension={0.01}
                        maxCursorMove={90}
                        xGap={12}
                        yGap={36}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  }
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <HowItWorksBlocks
                  text="Create Content"
                  className="border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400 group backdrop-blur-sm"
                  children={
                    <div className="absolute inset-0 z-0">
                      <MetaBalls
                        color="#22d3ee"
                        cursorBallColor="#22d3ee"
                        cursorBallSize={4}
                        ballCount={15}
                        animationSize={30}
                        enableMouseInteraction={true}
                        enableTransparency={false}
                        hoverSmoothness={0.05}
                        clumpFactor={1}
                        speed={0.3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  }
                />
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                <HowItWorksBlocks
                  text="Earn Rewards"
                  className="border-amber-500/30 bg-amber-500/5 hover:border-amber-400 group backdrop-blur-sm"
                  children={
                    <div className="absolute inset-0 z-0">
                      <Particles
                        particleColors={["#fbbf24"]}
                        particleCount={200}
                        particleSpread={10}
                        speed={0.1}
                        particleBaseSize={100}
                        moveParticlesOnHover={true}
                        alphaParticles={false}
                        disableRotation={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  }
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Roles Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container px-4 sm:px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI-Powered Precision
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Let our AI analyze, and validate your work—instantly.
            </p>
          </motion.div>

          <div className="w-full h-[400px] relative mb-16">
            <h4 className="text-white text-4xl font-extrabold absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-10">
              Hello!
            </h4>
            <OrbWithTextTrail
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={0}
              forceHoverState={true}
              fillContainer={true}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container px-4 sm:px-6">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-[80px] opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:16px_16px] opacity-20 rounded-3xl"></div>
            
            {/* Main content container */}
            <div className="relative bg-gradient-to-b from-gray-900/80 to-black/90 rounded-3xl overflow-hidden border border-gray-800/30 backdrop-blur-sm shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-60 h-60">
                <Particles 
                  particleColors={["#10b981", "#22d3ee"]}
                  particleCount={100}
                  particleSpread={8}
                  speed={0.05}
                  particleBaseSize={80}
                  moveParticlesOnHover={false}
                  alphaParticles={true}
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40">
                <MetaBalls
                  color="#10b981"
                  cursorBallColor="#10b981"
                  cursorBallSize={2}
                  ballCount={6}
                  animationSize={20}
                  enableMouseInteraction={false}
                  enableTransparency={true}
                  hoverSmoothness={0.1}
                  clumpFactor={0.8}
                  speed={0.2}
                />
              </div>

              <div className="p-8 md:p-16 flex flex-col items-center text-center justify-center relative z-10">
                <Badge variant="outline" className="mb-6 px-4 py-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-full">
                  Start Today
                </Badge>
                <motion.h2 
                  className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Transform your writing into crypto rewards
                  </span>
                </motion.h2>
                
                <motion.p 
                  className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Join thousands of writers already earning crypto for their content. 
                  Create an account today and discover campaigns that match your expertise.
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Button
                    asChild
                    className="rounded-full py-6 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 border-0 shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 text-base font-medium"
                  >
                    <Link href="/apps/account/register">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full py-6 px-8 border-gray-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-300 text-base font-medium"
                  >
                    <Link href="/apps">
                      Browse Campaigns
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-20 relative">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-800/50 pt-8">
            <div className="mb-6 md:mb-0">
              <p className="text-sm text-gray-500 mt-2">
                © 2025 WriteOn. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
