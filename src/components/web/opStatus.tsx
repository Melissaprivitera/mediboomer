import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SendUserOperationWithEOA } from "@account-kit/react";
import { chain } from "@/config";
import { EntryPointRegistryBase } from "@alchemy/aa-core";

export const OpStatus = ({
  sendUserOperationResult,
  isSendingUserOperation,
  isSendUserOperationError,
}: {
  sendUserOperationResult: SendUserOperationWithEOA<keyof EntryPointRegistryBase<unknown>> | undefined;
  isSendingUserOperation: boolean;
  isSendUserOperationError: Error | null;
}) => {
  if (isSendUserOperationError) {
    return <div className="text-center">An error occurred. Try again!</div>;
  }

  if (isSendingUserOperation) {
    return <LoadingSpinner />;
  }

  if (sendUserOperationResult) {
    return (
      <a
        href={`${chain.blockExplorers?.default.url}/tx/${sendUserOperationResult.hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-[#363FF9] hover:underline dark:text-white"
      >
        View transaction details
      </a>
    );
  }

  return <div className="invisible">placeholder</div>;
};
