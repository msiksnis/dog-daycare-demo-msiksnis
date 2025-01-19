import {
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Owner } from "@prisma/client";
import { updateOwnerAction } from "../actions/updateOwnerAction";
import { createOwnerAction } from "../actions/createOwnerAction";

/**
 * Custom hook to handle owner mutations (create/update).
 * Utilizes react-query for managing server state and caching.
 *
 * @returns {object} Mutation object with methods to trigger the mutation.
 */
export function useOwnerMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const ownersQueryKey = ["owners"];

  const mutation = useMutation({
    /**
     * Function to perform the mutation (create or update an owner).
     *
     * @param {object} params - Parameters for the mutation.
     * @param {boolean} params.isUpdate - Flag indicating if the operation is an update.
     * @param {string} [params.ownerId] - ID of the owner to update (required for updates).
     * @param {string} params.name - Name of the owner.
     * @param {string} [params.email] - Email of the owner.
     * @param {string} [params.mobile] - Mobile number of the owner.
     * @param {string} [params.workPhone] - Work phone number of the owner.
     * @param {string} [params.address] - Address of the owner.
     * @param {string} [params.emergencyContact] - Emergency contact of the owner.
     * @returns {Promise<object>} The newly created or updated owner.
     */
    mutationFn: async ({
      isUpdate,
      ownerId,
      ...ownerData
    }: {
      isUpdate: boolean;
      ownerId?: string;
      name: string;
      email?: string;
      mobile?: string;
      workPhone?: string;
      address?: string;
      emergencyContact?: string;
    }) => {
      if (isUpdate && ownerId) {
        return updateOwnerAction(ownerId, ownerData);
      } else {
        return createOwnerAction(ownerData);
      }
    },
    /**
     * Optimistically update the cache before the mutation is completed.
     *
     * @param {object} newOwnerData - Data of the owner being created or updated.
     * @returns {object} Snapshot of the previous owners state.
     */
    onMutate: async (newOwnerData) => {
      await queryClient.cancelQueries({ queryKey: ownersQueryKey });

      const previousOwners = queryClient.getQueryData<Owner[]>(ownersQueryKey);

      queryClient.setQueryData<Owner[]>(ownersQueryKey, (oldOwners = []) => {
        if (newOwnerData.isUpdate) {
          return oldOwners.map((owner) =>
            owner.id === newOwnerData.ownerId
              ? { ...owner, ...newOwnerData }
              : owner,
          );
        } else {
          const newOwner = {
            id: "temp-id",
            name: newOwnerData.name,
            email: newOwnerData.email || null,
            mobile: newOwnerData.mobile || null,
            workPhone: newOwnerData.workPhone || null,
            address: newOwnerData.address || null,
            emergencyContact: newOwnerData.emergencyContact || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...oldOwners, newOwner];
        }
      });

      return { previousOwners };
    },
    /**
     * Handle successful mutation by updating the cache and navigating.
     *
     * @param {object} newOwner - The owner data returned from the server.
     * @param {object} variables - Variables used in the mutation.
     */
    onSuccess: async (newOwner, variables) => {
      const queryFilter = {
        queryKey: ownersQueryKey,
        predicate(query) {
          return query.queryKey.includes(ownersQueryKey);
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueryData<Owner[]>(ownersQueryKey, (oldOwners = []) => {
        if (variables.isUpdate) {
          return oldOwners.map((owner) =>
            owner.id === variables.ownerId ? newOwner : owner,
          );
        } else {
          return oldOwners.map((owner) =>
            owner.id === "temp-id" ? newOwner : owner,
          );
        }
      });

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast.success(
        `Owner ${variables.isUpdate ? "updated" : "created"} successfully`,
      );
      router.push(`/owners/${newOwner.id}`);
    },
    /**
     * Handle errors during mutation by rolling back the cache.
     *
     * @param {Error} error - The error that occurred.
     * @param {object} newOwnerData - Data of the owner being created or updated.
     * @param {object} context - Context returned from onMutate.
     */
    onError: (error, newOwnerData, context) => {
      console.error("Error updating/creating owner:", error);
      queryClient.setQueryData(ownersQueryKey, context?.previousOwners);
      toast.error(
        `Failed to ${newOwnerData.isUpdate ? "update" : "create"} owner. Please try again.`,
      );
    },
  });

  return mutation;
}
