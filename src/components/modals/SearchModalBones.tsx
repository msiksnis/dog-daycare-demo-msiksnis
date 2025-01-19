import { Modal, ModalContent } from "../Modal";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  optionalClassName?: string;
  optionalTitleClassName?: string;
}

export function SearchModalBones({
  title,
  description,
  isOpen,
  onClose,
  children,
  optionalClassName,
  optionalTitleClassName,
}: ModalProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onChange}>
      <ModalContent
        side={"top"}
        className={optionalClassName || ""}
        hideCloseButton
      >
        {children}
      </ModalContent>
    </Modal>
  );
}
