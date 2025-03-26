import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Logo from "../assets/logo.png";
import Bg from "../assets/background.webp";

export default function AuthPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const rawData = { username, password }; // Raw data
    console.log("Sending raw data:", rawData);
  
    try {
      // Attempt to log in
      const loginResponse = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawData),
      });
  
      const loginData = await loginResponse.json();
      console.log("Login Response:", loginData);
  
      if (loginResponse.ok) {
        navigate(`/${loginData.userId}/dashboard`);
      } else {
        console.log("User not found, attempting registration...");
  
        // If login fails, attempt to register
        const registerResponse = await fetch("http://localhost:3000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rawData),
        });
  
        const registerData = await registerResponse.json();
        console.log("Register Response:", registerData);
  
        if (registerResponse.ok) {
          navigate(`/${registerData.userId}/dashboard`);
        } else {
          console.error("Error:", registerData.error);  
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-col flex-1 items-center justify-center gap-10">
          <div className="flex justify-center gap-2 md:justify-center">
            <Link to="/" className="flex items-center gap-2 font-medium">
              <div className="flex w-28 items-center justify-center rounded-md text-primary-foreground">
                <img src={Logo} alt="Logo" />
              </div>
            </Link>
          </div>
          <div className="w-full max-w-xs">
            <form onSubmit={handleLoginOrRegister} className={cn("flex flex-col gap-6")}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Dive into your account</h1>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="text"
                    type="text"
                    placeholder="admin"
                    // required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    // required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing up..." : "Sign up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img src={Bg} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}
