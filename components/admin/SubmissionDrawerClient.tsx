"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormWithFields, SubmissionDetail } from "@/lib/registration-types";
// We need to import the component if we can, but since it's in the same file as Panel, we'll need to extract it or pass it.
