"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Switch } from "@/app/components/ui/switch";
import { Cog, Eye, Filter, Plus, Search, Trash } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Vehicle } from "@/app/types";
import {
  addVehicle,
  deleteVehicleById,
  filterVehicleTypes,
  updateVehicle,
  uploadMedia,
} from "./action";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const defaultFilters = {
  category: "",
  fuelType: "",
  availabilityStatus: "true",
  occupancy: "",
  suitcaseCapacity: "",
  estimatedDistanceCoverage: "",
};

export default function VehiclesPage() {
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[] | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [filters, setFilters] = useState({ ...defaultFilters });

  // Function to handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  const { data } = useSession();
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Vehicle name must be at least 2 characters.",
    }),
    category: z.enum(["economy", "luxury"]),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    photo: z.any(),
    vehiclePlateNumber: z.string().min(6, {
      message: "Plate number must be at least 6 characters.",
    }),
    features: z.string(),
    maxOccupancy: z.coerce.number().min(1, {
      message: "Max occupancy must be at least 1.",
    }),
    maxStorageCapacityLtr: z.coerce.number().min(1, {
      message: "Max storage capacity must be at least 1 liter.",
    }),
    maxSuitcaseCapacity: z.coerce.number().min(0, {
      message: "Max suitcase capacity must be at least 1.",
    }),
    maxEstimatedDistanceCoverageKm: z.coerce.number().min(1, {
      message: "Max estimated distance coverage must be at least 1 km.",
    }),
    distancePriceMultiplier: z.coerce.number().min(0, {
      message: "Distance price multiplier must be a positive number.",
    }),
    hourlyPriceMultiplier: z.coerce.number().min(0, {
      message: "Hourly price multiplier must be a positive number.",
    }),
    fuelType: z.enum(["electric", "gas"]),
    availabilityStatus: z.boolean(),
  });

  const defaultValues: z.infer<typeof formSchema> = {
    name: "",
    category: "economy",
    description: "",
    photo: null,
    vehiclePlateNumber: "",
    features: "",
    maxOccupancy: 0,
    maxStorageCapacityLtr: 0,
    maxSuitcaseCapacity: 0,
    maxEstimatedDistanceCoverageKm: 0,
    distancePriceMultiplier: 0,
    hourlyPriceMultiplier: 0,
    fuelType: "electric",
    availabilityStatus: true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues },
    mode: "onChange",
  });

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    form.reset({
      ...vehicle,
      category: vehicle.category as "economy" | "luxury",
      features: "",
      fuelType: vehicle.fuelType as "electric" | "gas",
      photo: null,
    });
    setTags([...vehicle.features]);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVehicle?._id) return toast.error("Failed to delete vehicle");
    await deleteVehicleById(data?.user.sessionToken!, selectedVehicle._id);
    setVehiclesList((prevList) =>
      prevList ? prevList.filter((v) => v._id !== selectedVehicle._id) : null
    );
    setDeleteModalOpen(false);
    setSelectedVehicle(null);
    toast.success("Vehicle deleted successfully");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing) {
      const newVehicle = {
        ...values,
        features: [...tags],
      };
      setOpen(false);
      let fileUrl = "";
      if (values.photo) {
        const { filePath } = await uploadMedia(values.photo[0]);
        if (!filePath) return toast.error("Failed to upload image");
        fileUrl = filePath;
      } else {
        fileUrl = selectedVehicle?.photo || "";
      }
      const { _id } = await updateVehicle(
        data?.user.sessionToken!,
        selectedVehicle?._id!,
        {
          name: newVehicle.name,
          description: newVehicle.description,
          photo: fileUrl,
          vehiclePlateNumber: newVehicle.vehiclePlateNumber,
          category: newVehicle.category,
          features: newVehicle.features,
          distancePriceMultiplier: newVehicle.distancePriceMultiplier,
          hourlyPriceMultiplier: newVehicle.hourlyPriceMultiplier,
          maxOccupancy: newVehicle.maxOccupancy,
          maxStorageCapacityLtr: newVehicle.maxStorageCapacityLtr,
          maxSuitcaseCapacity: newVehicle.maxSuitcaseCapacity,
          maxEstimatedDistanceCoverageKm:
            newVehicle.maxEstimatedDistanceCoverageKm,
          fuelType: newVehicle.fuelType,
          availabilityStatus: newVehicle.availabilityStatus,
        }
      );
      if (!_id) return toast.error("Failed to Edit vehicle");

      toast.success("Vehicle Edited successfully");
      setTags([]);
      setIsEditing(false);
    } else {
      const newVehicle = {
        _id: (vehiclesList?.length || 0) + 1,
        ...values,
        features: [...tags],
      };

      setOpen(false);
      let fileUrl = "";
      if (values.photo) {
        const { filePath } = await uploadMedia(values.photo[0]);
        if (!filePath) return toast.error("Failed to upload image");
        fileUrl = filePath;
      }

      const { _id } = await addVehicle(data?.user.sessionToken!, {
        name: newVehicle.name,
        description: newVehicle.description,
        photo: fileUrl,
        vehiclePlateNumber: newVehicle.vehiclePlateNumber,
        category: newVehicle.category,
        features: newVehicle.features,
        distancePriceMultiplier: newVehicle.distancePriceMultiplier,
        hourlyPriceMultiplier: newVehicle.hourlyPriceMultiplier,
        maxOccupancy: newVehicle.maxOccupancy,
        maxStorageCapacityLtr: newVehicle.maxStorageCapacityLtr,
        maxSuitcaseCapacity: newVehicle.maxSuitcaseCapacity,
        maxEstimatedDistanceCoverageKm:
          newVehicle.maxEstimatedDistanceCoverageKm,
        fuelType: newVehicle.fuelType,
        availabilityStatus: newVehicle.availabilityStatus,
      });
      if (!_id) return toast.error("Failed to add vehicle");

      toast.success("Vehicle added successfully");
      setTags([]);
    }
    window.location.reload();
    form.reset();
  }

  const applyFilters = async () => {
    const filteredParams: Record<string, any> = {};

    if (filters.category && filters.category.trim() !== "") {
      filteredParams.category = filters.category as "economy" | "luxury";
    }
    if (filters.fuelType && filters.fuelType.trim() !== "") {
      filteredParams.fuelType = filters.fuelType as "electric" | "gas";
    }
    if (filters.availabilityStatus === "true") {
      filteredParams.availabilityStatus = true;
    }
    if (filters.availabilityStatus === "false") {
      filteredParams.availabilityStatus = false;
    }
    if (filters.occupancy && filters.occupancy.trim() !== "") {
      filteredParams.occupancy = parseInt(filters.occupancy);
    }
    if (filters.suitcaseCapacity && filters.suitcaseCapacity.trim() !== "") {
      filteredParams.suitcaseCapacity = parseInt(filters.suitcaseCapacity);
    }
    if (
      filters.estimatedDistanceCoverage &&
      filters.estimatedDistanceCoverage.trim() !== ""
    ) {
      filteredParams.estimatedDistanceCoverageKm = parseInt(
        filters.estimatedDistanceCoverage
      );
    }

    const { vehicleTypes } = await filterVehicleTypes(filteredParams);
    setVehiclesList(vehicleTypes);
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters });
  };

  useEffect(() => {
    async function getVehicles() {
      const { vehicleTypes } = await filterVehicleTypes({
        availabilityStatus: true,
      });
      setVehiclesList(vehicleTypes);
    }

    getVehicles();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <div className="flex space-x-2 ">
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSelectedVehicle(null);
                setIsEditing(false);
                setOpen(false);
                form.reset({ ...defaultValues });
                setTags([]);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  form.reset();
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[80vh] overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Vehicle Details */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mercedes-Benz S-Class"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Vehicle description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => {
                      const handleKeyDown = (
                        e: React.KeyboardEvent<HTMLInputElement>
                      ) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const trimmedValue = field.value.trim();
                          if (trimmedValue.length > 0) {
                            if (tags.includes(trimmedValue)) return;
                            setTags((prevTags) => [...prevTags, trimmedValue]);
                            field.onChange("");
                          }
                        }
                      };

                      return (
                        <FormItem>
                          <FormLabel>Features</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Heated seats, Bluetooth"
                              {...field}
                              onKeyDown={handleKeyDown}
                            />
                          </FormControl>
                          <FormMessage />
                          {/* Render tags */}
                          <div className="mt-8 flex flex-wrap">
                            {tags.map((tag, index) => (
                              <span
                                key={index}
                                onClick={() => {
                                  setTags((prevTags) =>
                                    prevTags.filter((t) => t !== tag)
                                  );
                                }}
                                className="bg-blue-200 text-blue-800 py-[1px] mt-[4px] px-3 mr-2 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </FormItem>
                      );
                    }}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehiclePlateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Plate Number</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Max Occupancy, Max Storage, Max Suitcases */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="maxOccupancy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Occupancy</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxStorageCapacityLtr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Storage Capacity (ltr)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxSuitcaseCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Suitcase Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="3"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Distance, Price Multipliers */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxEstimatedDistanceCoverageKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Distance Coverage (km)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="400" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="distancePriceMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance Price Multiplier ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hourlyPriceMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Price Multiplier ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1.2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gas Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a Gas Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electric">Electric</SelectItem>
                              <SelectItem value="gas">Gas</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Availability and Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files)}
                            />
                          </FormControl>
                          {selectedVehicle?.photo}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availabilityStatus"
                      render={({ field }) => (
                        <FormItem className="gap-4 flex items-center mt-4">
                          <FormLabel className="mt-2">Available</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {isEditing ? "Edit Vehicle Details" : "Add Vehicle"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={openFilter}
            onOpenChange={(isOpenFilter) => {
              if (!isOpenFilter) {
                setOpenFilter(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setOpenFilter(true);
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]  overflow-y-auto px-6 py-4">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>

              {/* Filters Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="economy">Economy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Type Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.fuelType}
                    onValueChange={(value) =>
                      handleFilterChange("fuelType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fuel Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Status Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.availabilityStatus}
                    onValueChange={(value) =>
                      handleFilterChange("availabilityStatus", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupancy Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.occupancy}
                    onValueChange={(value) =>
                      handleFilterChange("occupancy", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Occupancy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Up to 3 People</SelectItem>
                      <SelectItem value="4">Up to 4 People</SelectItem>
                      <SelectItem value="5">Up to 5 People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Suitcase Capacity Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.suitcaseCapacity}
                    onValueChange={(value) =>
                      handleFilterChange("suitcaseCapacity", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Suitcase Capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Suitcase</SelectItem>
                      <SelectItem value="2">2 Suitcases</SelectItem>
                      <SelectItem value="3">3 Suitcases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Distance Coverage Filter */}
                <div className="flex flex-col">
                  <Select
                    value={filters.estimatedDistanceCoverage}
                    onValueChange={(value) =>
                      handleFilterChange("estimatedDistanceCoverage", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Distance Coverage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="150">150 km</SelectItem>
                      <SelectItem value="200">200 km</SelectItem>
                      <SelectItem value="300">300 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply Filters Button */}
                <div className="flex items-center justify-end space-x-2  sm:col-span-3">
                  <Button onClick={clearFilters}>Clear Filters</Button>
                  <Button
                    onClick={() => {
                      setOpenFilter(false);
                      applyFilters();
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vehicles Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Plate Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiclesList?.map((vehicle) => (
            <TableRow key={vehicle._id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Image
                    src={
                      vehicle.photo === "" ? "/images/logo.png" : vehicle.photo
                    }
                    alt={vehicle.name}
                    width={200}
                    height={200}
                    className="w-12 h-12 rounded"
                  />
                  <span>{vehicle.name}</span>
                </div>
              </TableCell>
              <TableCell>{vehicle.category}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    vehicle.availabilityStatus ? "default" : "destructive"
                  }
                >
                  {vehicle.availabilityStatus ? "Available" : "Not Available"}
                </Badge>
              </TableCell>
              <TableCell>{vehicle.vehiclePlateNumber}</TableCell>
              <TableCell className="space-x-0 px-0">
                <Button size="sm" variant="link">
                  <Eye
                    className="h-5"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setViewOpen(true);
                    }}
                  />
                </Button>
                <Button size="sm" variant="link">
                  <Cog className="h-5" onClick={() => handleEdit(vehicle)} />
                </Button>
                <Button size="sm" variant="link">
                  <Trash
                    className="h-5"
                    onClick={() => handleDelete(vehicle)}
                  />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedVehicle && viewOpen && (
        <Dialog
          open={viewOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedVehicle(null);
              setViewOpen(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-[600px] p-6 h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Vehicle Details
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-scroll">
              <div className="sm:col-span-2 flex justify-center">
                <Image
                  src={
                    selectedVehicle.photo === ""
                      ? "/images/logo.png"
                      : selectedVehicle.photo
                  }
                  alt={`${selectedVehicle.name} photo`}
                  width={400}
                  height={400}
                  className="w-48 h-48 max-w-xs object-cover rounded-lg"
                />
              </div>
              <p>
                <strong>Name:</strong> {selectedVehicle.name}
              </p>
              <p>
                <strong>Category:</strong> {selectedVehicle.category}
              </p>
              <p className="sm:col-span-2">
                <strong>Description:</strong> {selectedVehicle.description}
              </p>
              <p>
                <strong>Plate Number:</strong>{" "}
                {selectedVehicle?.vehiclePlateNumber}
              </p>
              <p>
                <strong>Gas Type:</strong> {selectedVehicle.fuelType}
              </p>
              <p>
                <strong>Max Occupancy:</strong> {selectedVehicle.maxOccupancy}
              </p>
              <p>
                <strong>Max Storage (L):</strong>{" "}
                {selectedVehicle.maxStorageCapacityLtr}
              </p>
              <p>
                <strong>Max Suitcases:</strong>{" "}
                {selectedVehicle.maxSuitcaseCapacity}
              </p>
              <p>
                <strong>Distance Coverage (km):</strong>{" "}
                {selectedVehicle.maxEstimatedDistanceCoverageKm}
              </p>
              <p>
                <strong>Price Multiplier:</strong>{" "}
                {selectedVehicle.distancePriceMultiplier}
              </p>
              <p>
                <strong>Hourly Rate:</strong>{" "}
                {selectedVehicle.hourlyPriceMultiplier}
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                {selectedVehicle.availabilityStatus
                  ? "Available"
                  : "Unavailable"}
              </p>

              <p className="sm:col-span-2">
                <strong>Features:</strong> {selectedVehicle.features.join(", ")}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedVehicle(null);
                  setViewOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {deleteModalOpen && (
        <Dialog
          open={deleteModalOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setDeleteModalOpen(false);
              setSelectedVehicle(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[400px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this vehicle?</p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedVehicle(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
