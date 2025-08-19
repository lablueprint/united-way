import Image from 'next/image';
import React, { useState } from 'react';
import { close } from '../../../public/EventEditor/EventEditor-index';
import { EventTags } from "../_interfaces/EventInterfaces";
import '../_styles/TagModal.css';

interface TagModalInterface {
    tags: boolean[];
    setTags: React.Dispatch<React.SetStateAction<boolean[]>>;
    setIsDisplayingTagModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const selectedTagColors = ["tag-selected-red", "tag-selected-salmon", "tag-selected-yellow"]

const TagModal: React.FC<TagModalInterface> = ({ tags, setTags, setIsDisplayingTagModal }) => {
    const [workingSetTags, setWorkingSetTags] = useState<boolean[]>(tags);
    return (
        <div className="gray-opacity-overlay">
            <div className="modal-content">
                <div className="modal-text-parent">
                    <div className="modal-close-image" onClick={() => {
                        setIsDisplayingTagModal(false);
                    }}>
                        <Image src={close} alt="Close Icon" width={16} height={16} />
                    </div>
                    <div className="modal-title">
                        ADD TAGS
                    </div>
                    <div className="modal-subtitle">
                        For guests to filter out events
                    </div>
                </div>
                <div className="modal-tag-parent">
                    {
                        EventTags.map((tagName, index) => {
                            return (
                                <div
                                    className={workingSetTags[index] ? selectedTagColors[(index) % 3] : "tag-not-selected"}
                                    key={index}
                                    onClick={() => {
                                        const newTags = [...workingSetTags];
                                        newTags[index] = !newTags[index];
                                        setWorkingSetTags(newTags);
                                    }}
                                >
                                    {tagName}
                                </div>
                            )
                        })
                    }
                </div>
                <div className="cancel-save">
                    {
                        workingSetTags.includes(true) ?
                            <div className="save-button" onClick={() => {
                                setTags(workingSetTags);
                                setIsDisplayingTagModal(false);
                            }}>
                                Save
                            </div>
                            :
                            <div className="cancel-text" onClick={() => {
                                setIsDisplayingTagModal(false);
                            }}>
                                Cancel
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default TagModal;