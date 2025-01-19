import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./Modal";

interface ModalBonesProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  optionalClassName?: string;
  optionalTitleClassName?: string;
  side?: "top" | "secondary" | "bottom" | "left" | "right" | null | undefined;
}

export function ModalBones({
  title,
  description,
  isOpen,
  onClose,
  children,
  side,
  optionalClassName,
  optionalTitleClassName,
}: ModalBonesProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onChange}>
      <ModalContent
        {...(!description && { "aria-describedby": undefined })}
        className={
          optionalClassName || "flex flex-col items-start overflow-hidden"
        }
        side={side}
      >
        <ModalHeader>
          {title && (
            <ModalTitle className={optionalTitleClassName || ""}>
              {title}
            </ModalTitle>
          )}
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <div className="w-full">{children}</div>
      </ModalContent>
    </Modal>
  );
}
