import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { requestRoleChangeAction } from "../actions/requestRoleChangeAction";
import { RoleChangeInput } from "../validationSchemas";
import { Role } from "@prisma/client";

interface RoleChangeResponse {
  id: string;
  userId: string;
  reason: string | null;
  requestedRole: Role;
}

export const useRequestRoleChangeMutation = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  return useMutation<RoleChangeResponse, Error, RoleChangeInput>({
    mutationFn: async (input) => {
      const response = await requestRoleChangeAction(input);
      return {
        id: response.id,
        userId: response.userId,
        reason: response.reason,
        requestedRole: response.requestedRole,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Role change requested successfully!");
    },
    onError: (error) => {
      toast.error(`Error requesting role change: ${error.message}`);
    },
  });
};
