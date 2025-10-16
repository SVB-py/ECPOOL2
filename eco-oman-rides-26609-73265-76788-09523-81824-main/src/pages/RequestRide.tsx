import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Calendar, Users, Filter, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchRideSearchOptions, searchAvailableRides, type RideSearchResult } from "@/lib/requestRideService";

const defaultDate = new Date().toISOString().split("T")[0];

const RequestRide = () => {
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("07:00");
  const [riders, setRiders] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [studentsOnly, setStudentsOnly] = useState(false);
  const [parentsOnly, setParentsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [schoolRoutesOnly, setSchoolRoutesOnly] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RideSearchResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingRouteId, setBookingRouteId] = useState<string | null>(null);
  const [startOptions, setStartOptions] = useState<string[]>([]);
  const [endOptions, setEndOptions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) {
        return;
      }

      if (error) {
        console.error("Auth check failed", error);
        return;
      }

      if (data?.user) {
        setUserId(data.user.id);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const options = await fetchRideSearchOptions();
        if (!active) {
          return;
        }
        setStartOptions(options.startLocations);
        setEndOptions(options.endLocations);
      } catch (error) {
        console.error("Failed to load ride options", error);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    setSearchSubmitted(true);
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const results = await searchAvailableRides({
        from: from || undefined,
        to: to || undefined,
        date,
        time,
        riders,
        womenOnly,
        studentsOnly,
        parentsOnly,
        verifiedOnly,
        schoolRoutesOnly,
      });

      setSearchResults(results);

      if (results.length === 0) {
        setErrorMessage("No rides found for your search. Adjust the filters and try again.");
      }
    } catch (error) {
      console.error("Ride search failed", error);
      setErrorMessage("We could not load rides right now. Please try again in a moment.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestRide = async (ride: RideSearchResult) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in as a student to request a ride.",
        variant: "destructive",
      });
      return;
    }

    setBookingRouteId(ride.route.id);

    try {
      const pickupLocation = from || ride.route.start_location;
      const { error } = await supabase.from("bookings").insert({
        student_id: userId,
        route_id: ride.route.id,
        pickup_location: pickupLocation,
        dropoff_location: ride.route.end_location,
        pickup_time: ride.route.start_time,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Ride requested",
        description: `We'll notify ${ride.driverName} of your request.`,
      });

      setSearchResults((prev) =>
        prev
          .map((entry) =>
            entry.route.id === ride.route.id
              ? { ...entry, availableSeats: Math.max(entry.availableSeats - riders, 0) }
              : entry
          )
          .filter((entry) => entry.availableSeats > 0)
      );
    } catch (error) {
      console.error("Ride request failed", error);
      toast({
        title: "Could not request ride",
        description: "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setBookingRouteId(null);
    }
  };

  const sortedResults = useMemo(
    () =>
      [...searchResults].sort((a, b) => {
        if (b.routeMatchScore === a.routeMatchScore) {
          return new Date(a.route.start_time).getTime() - new Date(b.route.start_time).getTime();
        }
        return b.routeMatchScore - a.routeMatchScore;
      }),
    [searchResults]
  );

  const riderLabel = useMemo(() => (riders === 1 ? "1 person" : `${riders} people`), [riders]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-primary p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Ride</h1>
        <p className="text-muted-foreground">Search for verified school carpools</p>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <Card className="glass-card p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                From
              </label>
              <Input
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="Enter pickup location"
                className="bg-background/50"
                list="from-locations"
              />
              <datalist id="from-locations">
                {startOptions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                To
              </label>
              <Input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="Enter destination"
                className="bg-background/50"
                list="to-locations"
              />
              <datalist id="to-locations">
                {endOptions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  Date
                </label>
                <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Time
                </label>
                <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="bg-background/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Riders
              </label>
              <select
                value={riders}
                onChange={(event) => setRiders(Number(event.target.value) || 1)}
                className="w-full px-3 py-2 rounded-md bg-background/50 border border-input"
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
              </select>
            </div>

            <Button variant="ghost" className="w-full justify-between" type="button" onClick={() => setShowFilters((prev) => !prev)}>
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </span>
              <span>{showFilters ? "−" : "+"}</span>
            </Button>

            {showFilters && (
              <div className="space-y-3 pt-4 border-t border-border animate-fade-in">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={womenOnly} onChange={(event) => setWomenOnly(event.target.checked)} className="rounded" />
                  <span className="text-sm">Women-only rides</span>
                  <Badge variant="secondary" className="ml-auto">
                    👩
                  </Badge>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={studentsOnly} onChange={(event) => setStudentsOnly(event.target.checked)} className="rounded" />
                  <span className="text-sm">Students only</span>
                  <Badge variant="secondary" className="ml-auto">
                    🎓
                  </Badge>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={parentsOnly} onChange={(event) => setParentsOnly(event.target.checked)} className="rounded" />
                  <span className="text-sm">Parents only</span>
                  <Badge variant="secondary" className="ml-auto">
                    👨‍👩‍👧
                  </Badge>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="rounded" />
                  <span className="text-sm">Verified drivers only</span>
                  <Badge variant="secondary" className="ml-auto">
                    ✓
                  </Badge>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={schoolRoutesOnly} onChange={(event) => setSchoolRoutesOnly(event.target.checked)} className="rounded" />
                  <span className="text-sm">School routes only</span>
                  <Badge variant="secondary" className="ml-auto">
                    🚌
                  </Badge>
                </label>

                <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                  Showing {schoolRoutesOnly ? "school" : "all"} routes for {riderLabel}.
                </div>
              </div>
            )}

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              {isSearching ? "Searching..." : "Search Rides"}
            </Button>
          </form>
        </Card>

        {errorMessage && searchSubmitted && !isSearching && (
          <Card className="glass-card p-4 mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p>{errorMessage}</p>
          </Card>
        )}

        {searchSubmitted && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Available Rides</h2>
              <span className="text-sm text-muted-foreground">{sortedResults.length} routes</span>
            </div>

            {isSearching && (
              <Card className="glass-card p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Looking for rides near you...</span>
              </Card>
            )}

            {!isSearching && sortedResults.length === 0 && (
              <Card className="glass-card p-12 text-center">
                <div className="text-6xl mb-4">🛣️</div>
                <h3 className="text-xl font-bold mb-2">No rides found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or expand the search window.</p>
                <Button variant="outline" onClick={() => setShowFilters(true)}>
                  Adjust Filters
                </Button>
              </Card>
            )}

            {sortedResults.map((ride) => {
              const badges: string[] = [];
              const driverStatus = (ride.driver?.status ?? "").toLowerCase();
              const avatarFallbackText = ride.driverName ? ride.driverName.slice(0, 2).toUpperCase() : "DR";

              if ((ride.driverRating ?? 0) >= 4.5 || driverStatus.includes("verified")) {
                badges.push("Verified");
              }

              if (driverStatus.includes("women")) {
                badges.push("Women-only");
              }

              if (driverStatus.includes("parent")) {
                badges.push("Parents");
              }

              if (ride.route.end_location.toLowerCase().includes("school")) {
                badges.push("School Route");
              }

              return (
                <Card key={ride.route.id} className="glass-card p-4 hover-scale">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <Avatar className="w-16 h-16">
                      {ride.driverAvatar ? <AvatarImage src={ride.driverAvatar} /> : null}
                      <AvatarFallback>{avatarFallbackText}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg">{ride.driverName}</h3>
                        {ride.driverRating && (
                          <span className="text-sm text-muted-foreground">⭐ {ride.driverRating.toFixed(1)}</span>
                        )}
                        <Badge className="bg-primary/10 text-primary">{ride.routeMatchScore}% match</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ride.vehicleLabel}</p>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {ride.route.start_location} → {ride.route.end_location}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary" />
                          {ride.pickupTimeDisplay}
                        </span>
                        <span className="text-muted-foreground">
                          {ride.availableSeats}/{ride.totalSeats} seats free
                        </span>
                      </div>

                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {badges.map((badge) => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-end md:items-center gap-4 md:flex-col md:text-right">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{ride.pricePerSeat}</div>
                        <div className="text-xs text-muted-foreground">EcoCredits / seat</div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRequestRide(ride)}
                        disabled={bookingRouteId === ride.route.id}
                      >
                        {bookingRouteId === ride.route.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {bookingRouteId === ride.route.id ? "Requesting" : "Request"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RequestRide;
