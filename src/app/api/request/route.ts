import { ResponseType } from "@/lib/types/apiResponse";
import {
  createNewMockRequest,
  editMockStatusRequest,
  getMockItemRequests,
} from "@/server/mock/requests";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { InputException, InvalidInputError } from "@/lib/errors/inputExceptions";
import connectMongo from "@/mongodb/db"
import ItemRequest from "@/mongodb/requests"
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";


const PAGE_DEFAULT = "6";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    console.log("Status: " + status);
    const page = parseInt(url.searchParams.get("page") || PAGE_DEFAULT);
    try {
        if (page < 1) {
            throw new InvalidInputError("pages must be greater than 0");
        }

        await connectMongo();

        const query: Record<string, any> = {};
        if (status) {
            query.status = status;
        }

        // Count total documents for pagination info
        const totalCount = await ItemRequest.countDocuments();

        // Fetch paginated data in descending order of createdDate
        const requests = await ItemRequest.find(query)
            .sort({ createdDate: -1 }) // Descending order
            .limit(PAGINATION_PAGE_SIZE); // Limit items to the page size
        if (requests) {
            return new Response(JSON.stringify(requests), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            throw new Error();
        }
    } catch (e) {
        if (e instanceof InputException) {
        return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

export async function PUT(request: Request) {
  try {
    const req = await request.json();
    console.log(req);
    const newRequest = createNewMockRequest(req);


    await connectMongo();

    const itemRequest = new ItemRequest({
        newRequest
    });

    itemRequest.requestorName = newRequest.requestorName;
    itemRequest.itemRequested = newRequest.itemRequested;

    console.log("Request: " + itemRequest);

    const savedRequest = await itemRequest.save();

    if (savedRequest && savedRequest._id) {
        return new ServerResponseBuilder(ResponseType.SUCCESS).build();
    } else {
        throw new Error();
    }

  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    console.log(e);
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function PATCH(request: Request) {
  try {
    const req = await request.json();
    
    const { id, status } = req;

    // Validate input
    if (!id || !status) {
      return new InvalidInputError("Make sure id and status are parameters");
    }

    await connectMongo();

    const updatedRequest = await ItemRequest.findByIdAndUpdate(
        id, // Find by ID
        { 
          status, 
          lastEditedDate: new Date() // Update the lastEditedDate
        },
        { new: true } // Return the updated document
    );

    if (updatedRequest) {
        return new ServerResponseBuilder(ResponseType.SUCCESS).build();
    } else {
        throw new Error();
    }

  } catch (e) {
    if (e instanceof InputException) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}
